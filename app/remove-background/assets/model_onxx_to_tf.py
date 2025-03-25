import onnx
from onnx_tf.backend import prepare

# Load the ONNX model
onnx_model = onnx.load("model.onnx")

# Convert to TensorFlow format
tf_rep = prepare(onnx_model)

# Export the TensorFlow model
tf_rep.export_graph("model_tf")
