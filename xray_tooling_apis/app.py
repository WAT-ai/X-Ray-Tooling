from RAG.flows import FlowType
from RAG.chat import Chat 
#if getting a RAG module not found run: export PYTHONPATH="${PYTHONPATH}:path/to/xray-tooling-directory"
from pydantic import BaseModel
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import torch
import shutil
from torchvision.io import read_image
from torchvision.models import resnet50, efficientnet_b0, densenet121
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import os
import sys

from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))


app = FastAPI()

origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def modify_model(model, dropout_rate, num_classes=2):
    if hasattr(model, 'fc'):
        num_ftrs = model.fc.in_features
        model._fc = nn.Sequential(
            nn.Dropout(dropout_rate),
            nn.Linear(num_ftrs, num_classes)
        )
    elif hasattr(model, 'classifier'):  # DenseNet
        if isinstance(model.classifier, nn.Sequential):
            *layers, last_layer = model.classifier.children()
            num_ftrs = last_layer.in_features
            new_last_layer = nn.Linear(num_ftrs, num_classes)
            model.classifier = nn.Sequential(*layers, new_last_layer)
        else:
            num_ftrs = model.classifier.in_features
            model.classifier = nn.Linear(num_ftrs, num_classes)
    else:
        raise Exception("Unknown model architecture")
    return model


# model = modify_model(model, dropout_rate)
phase1_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

phase2_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

phase1_weights = torch.load(os.path.join(
    os.path.dirname(__file__), "../models/phase1_model.pth"))
phase1_model = efficientnet_b0(pretrained=False)
phase1_model = modify_model(phase1_model, dropout_rate=0.5)
phase1_model.load_state_dict(phase1_weights)
phase1_model.eval()
file_location = ""

# phase2_weights = torch.load("../models/phase2_model.pth")
# phase2_model = densenet121(pretrained=False)
# #phase2_model = modify_model(phase2_model, dropout_rate=0.5)
# phase2_model.load_state_dict(phase2_weights)
phase2_model = torch.load(os.path.join(
    os.path.dirname(__file__), "../models/phase2_model.pth"))
phase2_model.eval()


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global file_location
    contents = await file.read()
    print(contents)
    image_map = {"image/jpeg": ".jpg", "image/png": ".png",
                 "image/bmp": ".bmp", "image/gif": ".gif"}
    file_location = os.path.join(os.path.dirname(
        __file__), "../assets/", "1" + image_map[file.content_type])
    ##print(file_location, "file_location")
    with open(file_location, "wb+") as file_object:
        file_object.write(contents)
    return {"info": f"file '{file.filename}' saved at '{file_location}'"}


@app.get("/phase1")
async def phase1():
    # img = read_image("../CV-research/camera.jpeg")

    # initializing model with weights

    # model.eval()
    # preprocessing
    # preprocess = phase1_model.transforms()
    # #preprocess = weights.transforms()
    # batch = preprocess(img).unsqueeze(0)

    # getting result category as predicted
    global file_location
    img_path = file_location  # Assuming file_location is the path to the image file
    print(img_path)
    img = Image.open(img_path).convert("RGB")
    img = phase1_transform(img)
    img = img.unsqueeze(0)
    prediction = phase1_model(img).squeeze(0).softmax(0)
    class_id = prediction.argmax().item()
    score = prediction[class_id].item()
    # category_name = phase1_model.meta["categories"][class_id]
    print(f"{class_id}: {100 * score:.1f}%")
    return {"class_id": class_id, "score": score}


@app.get("/phase2")
async def phase2():
    global file_location
    img = Image.open(file_location).convert("RGB")
    img = phase2_transform(img)
    img = img.unsqueeze(0)
    prediction = phase2_model(img).squeeze(0).softmax(0)
    class_id = prediction.argmax().item()
    score = prediction[class_id].item()
    # category_name = phase1_model.meta["categories"][class_id]
    print(f"{class_id}: {100 * score:.1f}%")
    return {"class_id": class_id, "score": score}


chat_cohere = Chat(llm="cohere")
chat_openai = Chat(llm="openai")

models = {"cohere": chat_cohere, "openai": chat_openai}


class Query(BaseModel):
    text: str
    injury: str
    injury_location: str
    model: str


@app.post("/rag/query")
async def rag_query(query: Query):
    # return run_similarity_search(qu)

    text = query.text

    if query.model not in models:
        return {"error": "model not found."}

    model = models[query.model]
    return {"query": text, "response": model.query(text)}


@app.post("/rag/query/stream")
async def rag_query_steam(query: Query):
    # return run_similarity_search(qu)

    text = query.text
    injury = query.injury
    injury_location = query.injury_location

    if query.model not in models:
        return {"error": "model not found."}

    model = models['openai']
    return StreamingResponse(model.stream_query(text, injury, injury_location), media_type="text/event-stream")

class FlowQuery(BaseModel):
    flow: str
    injury: str
    injury_location: str
    model: str


@app.post("/rag/flow")
async def rag_flow(flow_query: FlowQuery):
    # return run_similarity_search(qu)

    if flow_query.model not in models:
        return {"error": "model not found."}

    flow = FlowType(flow_query.flow)
    model = models[flow_query.model]

    return {"injury": flow_query.injury, "injury_location": flow_query.injury_location, "flow": flow.value, "response": model.flow_query(flow_query.injury, flow_query.injury_location, flow)}

class MultiFlowQuery(BaseModel):
    flows: list[str]
    injury: str
    injury_location: str
    model: str

from concurrent.futures.thread import ThreadPoolExecutor
import concurrent.futures

def worker(injury, injury_location, flow, model: Chat):
    response = model.flow_query(injury, injury_location, flow)
    return (flow, response)

def generate_flows(injury, injury_location, flows, model: Chat):
  executor = ThreadPoolExecutor(max_workers=10)

  futures = [executor.submit(worker, injury, injury_location, flow, model) for flow in flows]
  done, not_done = concurrent.futures.wait(futures, return_when=concurrent.futures.ALL_COMPLETED)

  res = []

  for task in done:
    res.append(task.result())

  return res


@app.post("/rag/flow/async")
async def rag_flow(flow_query: MultiFlowQuery):
    # return run_similarity_search(qu)

    if flow_query.model not in models: return {"error": "model not found."}
    
    flows = [FlowType(flow) for flow in flow_query.flows]
    model = models[flow_query.model]

    coroutine = generate_flows(flow_query.injury, flow_query.injury_location, flows, model)
    #print(coroutine)

    return {"injury": flow_query.injury, "injury_location": flow_query.injury_location, "responses": coroutine}

'''
@app.post("/rag/flow/stream")
def rag_flow(flow_query: FlowQuery):
    # return run_similarity_search(qu)

    if flow_query.model not in models:
        return {"error": "model not found."}

    flow = FlowType(flow_query.flow)
    model = models['openai']

    return StreamingResponse(model.stream_flow_query(flow_query.injury, flow_query.injury_location, flow), media_type="text/event-stream")
'''
@app.post("/rag/flow/stream/expectation")
def rag_flow1(flow_query: FlowQuery):
    return handle_flow(flow_query)

@app.post("/rag/flow/stream/base")
def rag_flow2(flow_query: FlowQuery):
    return handle_flow(flow_query)

@app.post("/rag/flow/stream/heat_ice")
def rag_flow3(flow_query: FlowQuery):
    return handle_flow(flow_query)

@app.post("/rag/flow/stream/restriction")
def rag_flow4(flow_query: FlowQuery):
    return handle_flow(flow_query)

def handle_flow(flow_query: FlowQuery):
    if flow_query.model not in models:
        return {"error": "model not found."}

    flow = FlowType(flow_query.flow)
    model = models['openai']

    return StreamingResponse(model.stream_flow_query(flow_query.injury, flow_query.injury_location, flow), media_type="text/event-stream")