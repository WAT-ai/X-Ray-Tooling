#!/bin/bash

# checking for venv dir

if [ -d "venv" ]; then
    echo "Virtual environment found. Activating..."
    source venv/bin/activate
else
    echo "Virtual environment not found. Creating..."
    python3 -m venv venv
    source venv/bin/activate
fi

# Installing torchvision dependencies for cpu compatibility
echo "Installing PyTorch, torchvision, and torchaudio..."
pip install torch==2.1.0 torchvision==0.16.0 torchaudio==2.1.0 --index-url https://download.pytorch.org/whl/cpu

# other dependencies
echo "Installing other dependencies from requirements.txt..."
pip install -r requirements.txt

echo "Setup completed."
