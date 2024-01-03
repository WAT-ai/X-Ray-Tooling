from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
import shutil
from torchvision.io import read_image
from torchvision.models import resnet50, efficientnet_b0, densenet121
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import os, sys

from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
from xray_tooling_apis.temp_embedding_module import PubmedEmbedding
import json
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def modify_model(model,dropout_rate,num_classes=2):
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
#model = modify_model(model, dropout_rate)
phase1_transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

phase2_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

phase1_weights = torch.load("../models/phase1_model.pth")
phase1_model = efficientnet_b0(pretrained=False)
phase1_model = modify_model(phase1_model, dropout_rate=0.5)
phase1_model.load_state_dict(phase1_weights)
phase1_model.eval()
file_location = ""

# phase2_weights = torch.load("../models/phase2_model.pth")
# phase2_model = densenet121(pretrained=False)
# #phase2_model = modify_model(phase2_model, dropout_rate=0.5)
# phase2_model.load_state_dict(phase2_weights)
phase2_model = torch.load("../models/phase2_model.pth")
phase2_model.eval()

pubmed = PubmedEmbedding()
def run_similarity_search(query):
    with open("../RAG/datasets/results.json", "r") as json_file:
        docs = json.load(json_file)
    docs = [{"snippet": value} for value in docs.values()]
    out = pubmed.nlp_cohere(docs, query)
    return out

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global file_location
    contents = await file.read()
    image_map = {"image/jpeg": ".jpg", "image/png": ".png", "image/bmp": ".bmp", "image/gif": ".gif"}
    file_location = "../assets/" + "1" + image_map[file.content_type]
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
    img = Image.open(file_location).convert("RGB")
    img = phase1_transform(img)
    img = img.unsqueeze(0)
    prediction = phase1_model(img).squeeze(0).softmax(0)
    class_id = prediction.argmax().item()
    score = prediction[class_id].item()
    #category_name = phase1_model.meta["categories"][class_id]
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
    #category_name = phase1_model.meta["categories"][class_id]
    print(f"{class_id}: {100 * score:.1f}%")
    return {"class_id": class_id, "score": score}

class Query(BaseModel):
    text: str

@app.post("/RAG")
async def RAG(query: Query):
    # return run_similarity_search(qu)
    text = query.text
    print(text)
    return {"query": text, "results": run_similarity_search(text)}