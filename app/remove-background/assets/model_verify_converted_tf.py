import tensorflow as tf

# Load the converted model
model = tf.saved_model.load('model_tf')
print("Model loaded successfully:", model)