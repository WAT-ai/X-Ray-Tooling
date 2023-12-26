## CV Model Research Summary
Model: DenseNet 
DenseNet's dense connectivity will be beneficial for tasks where detailed feature extraction is essential, such as fracture diagnosis. 
Dataset: FracAtlas
Includes labeled fracture and normal x-ray images of different body parts. Images also have labeled body parts. Thus, it will be a good dataset for steps 1 and 2. 
Classification: Binary (Fractured or Normal)
Easiest to begin with. If everything works, it can be expanded to multi-classification.
Object Detection Algorithm: Faster R-CNN
Efficient and fast object detection algorithm that can be combined with a DenseNet model backbone so the program can output the body part in addition to whether or not the bone is fractured (Step 2).

Input Image
   ->
DenseNet (Fracture or Not)
   ->
Faster R-CNN (Body Part Detection Algorithm)
   ->
Output: Binary classification of Fractured or Normal & body part

### Update after Implementation Attempt
Integrating Faster R-CNN and a DenseNet model in the same program is very complicated. Additionally, I found out that the FracAtlas dataset only contains labels for 4 different body parts: hand, leg, hip, shoulder. This wouldn't be ideal for step 2 as we want to be able to classify a lot more body parts. Thus, we split the two steps into their own models. 

## Step 1 Fracture Detection Model Info
Model: DenseNet

Dataset: FracAtlas

Classification: Binary (1 for fractured, 0 for not fractured)

Train-Val-Test Ratio: 70:15:15

Hyperparameter Configuration:
- Optimizer: SGD
- No. of epochs: 5
- Batch Size: 64
- Learning Rate: 0.001

This model and its configurations were the first that I decided to test. As shown in DenseNet_Model.ipynb, the validation accuracy was 74.56% for any number of epochs 1-5. This is a good start, but the accuracy can definitely be improved with further hyperparameter testing. As optimizing the Step 1 CV model isn't our priority at the moment, I may return to this after researching for Step 2 of the CV model. We can conclude from these tests that the number of epochs don't play a large role in determining validation accuracy. 

## Further Research for Step 2






