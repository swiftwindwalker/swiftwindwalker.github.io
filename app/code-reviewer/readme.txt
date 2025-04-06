To serve the phi-2 model from Microsoft using .safetensors, we will need to setup a local server using FastAPI.
This server will load the model and provide an endpoint to analyze code snippets from the UI.

Prerequisites:

Python 3.8 or higher installed on your system.​
Necessary Python packages: fastapi, uvicorn, transformers, torch, and safetensors.​

Setup Instructions:

Upgrade your Python (if needed, else skip)

brew install python@3.10

after installation check the Installed Version
python3.10 --version
You should see something like:
Python 3.10.xx
If you're still facing an issue.
Run this to install transformers, torch, uvicorn, and fastapi for Python 3.10:
python3.10 -m pip install --upgrade pip

install the required packaged
python3.10 -m pip install fastapi uvicorn transformers torch
python3.10 -m pip install --upgrade transformers
python3.10 -m pip show safetensors
python3.10 -m pip install --upgrade git+https://github.com/huggingface/transformers.git


Run Uvicorn using Python 3.10 explicitly:
python3.10 -m uvicorn server:app --host 0.0.0.0 --port 8000


Install Required Packages:

pip install fastapi uvicorn transformers torch safetensors


Download the phi-2 Model:

Visit the phi-2 Hugging Face page and follow the instructions to download the model files. Ensure that the .safetensors files are include
https://huggingface.co/microsoft/phi-2/tree/main

Update the path to the model on server.py:

Run the Server
uvicorn server:app --host 0.0.0.0 --port 8000

is interpreted as:

server: the Python filename (server.py) without the .py extension.
app: the FastAPI app object inside that server.py file.
So, Uvicorn is looking for a file named server.py in your current working directory,
and inside that file, it looks for an object named app, which is usually your FastAPI app instance like this:

The above command starts the server on http://localhost:8000.

what files are needed?

model-00001-of-00002.safetensors
model-00002-of-00002.safetensors

File Name	Why You Need It
config.json:	Defines the model architecture and parameters.
tokenizer.json:	Defines how text is split into tokens.
tokenizer_config.json:	Additional tokenizer settings.
special_tokens_map.json:	Maps tokens like <pad>, <eos>, etc.
generation_config.json:	Optional, helps set defaults like max_length.
vocab.json, merges.txt:	Sometimes needed, depending on tokenizer type.

Without these:

The model won’t load (config.json is essential).
Tokenization will fail (tokenizer.json + related files).
Generated text may be gibberish or improperly handled


if you're getting CORS error you can test it with

curl -X POST http://localhost:8000/test \
-H "Content-Type: application/json" \
-d '{}'

if it's working, you should get a response
{"message":"CORS test successful"}% 

The logs are now available
tail -f code_analysis.log


Check GPU Status:
curl http://localhost:8000/gpu-info | jq