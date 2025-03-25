import torch
import torch.onnx
from model import U2NET  # This imports the U2NET class from model.py

# Step 1: Load the model
model = U2NET()  # Instantiate the U2NET model from the class in model.py

# Step 2: Load the weights from the .pth file
model.load_state_dict(torch.load('u2net.pth', map_location=torch.device('cpu')))  # Load the pre-trained weights

# Step 3: Set the model to evaluation mode
model.eval()  # Set the model to evaluation mode

# Step 4: Create a dummy input tensor (match the model's input size)
dummy_input = torch.randn(1, 3, 320, 320)  # Adjust the input size according to U2NET

# Step 5: Convert the model to ONNX format
torch.onnx.export(
    model,               # The model to convert
    dummy_input,         # The dummy input tensor
    "model.onnx",        # The output file name for the ONNX model
    input_names=["input"],  # Name of the input layer
    output_names=["output"],  # Name of the output layer
    opset_version=11,    # ONNX opset version (adjust if needed)
    do_constant_folding=True,  # Optimize constants
    dynamic_axes={       # Optional: allow dynamic batch size
        'input': {0: 'batch_size'},
        'output': {0: 'batch_size'}
    }
)

print("Model successfully converted to model.onnx")