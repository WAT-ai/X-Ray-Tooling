# basic imports
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms

# cuda availability
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# transform to imagenet format
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Load the dataset
train_dataset = datasets.ImageFolder("/path/to/dataset/train", transform=transform)
val_dataset = datasets.ImageFolder("/path/to/dataset/val", transform=transform)

# Adjust labels to binary: fractured=1, not_fractured=0
# You need to ensure your dataset directory structure follows the format described above

# DataLoader
train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=64, shuffle=False)
val_loader = torch.utils.data.DataLoader(val_dataset, batch_size=64, shuffle=False)

# Pretrained, densenet model for imagenet
model = models.densenet121(pretrained=True)

# freezing all layers in the model
for param in model.parameters():
    param.requires_grad = False

# Replacing number of classes to classify into, to our desired number
num_classes = 2 # binary classification
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 2)  # binary classification, so 2 output neuron
model = nn.Sequential(model, nn.Sigmoid())  #use Sigmoid as the final activation, commonly used for binary classification


# loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(model.fc.parameters(), lr=0.001, momentum=0.9)

# fine tuning step
# Get to this cell once we have decided on a dataset

# play around with this number
num_epochs = 10

for epoch in range(num_epochs):
    model.train()
    for inputs, labels in train_loader:
        inputs, labels = inputs.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

    # Validation Accuracy
    model.eval()
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = torch.round(model(inputs))  # convert probabilities to binary predictions

            # loop through each prediction and label to check accuracy
            for output, label in zip(outputs, labels):
                predicted_class = "fractured" if output.item() == 1 else "not fractured"
                true_class = "fractured" if label.item() == 1 else "not fractured"

                # print out classification for each image
                if output == label:
                    print(f"Correctly classified: Predicted {predicted_class}, True label {true_class}")
                else:
                    print(f"Incorrectly classified: Predicted {predicted_class}, True label {true_class}")