import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.densenet import preprocess_input, DenseNet121
import numpy as np

# Load pre-trained DenseNet model (without the top classification layer)
base_model = DenseNet121(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

# Freeze the layers of the pre-trained model
for layer in base_model.layers:
    layer.trainable = False

# Create the binary classification model
model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(1, activation='sigmoid')  # Binary classification output
])

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Function to preprocess an input image
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return preprocess_input(img_array)

# Example usage
img_path = 'path/to/your/xray_image.jpg'
preprocessed_img = preprocess_image(img_path)

# Make a prediction
prediction = model.predict(preprocessed_img)

# Display the prediction (0: No fracture, 1: Fracture)
if prediction[0][0] > 0.5:
    print("Fracture detected!")
else:
    print("No fracture detected.")
