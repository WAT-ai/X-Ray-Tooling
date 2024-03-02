#!/bin/bash

# Check if the sqlite file exists
if [ ! -f "./sqlite" ]; then
    # If the file does not exist, execute the Python commands
    python chroma_embedding.py --use_openai build

fi