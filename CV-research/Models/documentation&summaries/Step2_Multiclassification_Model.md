## Dataset Summary
To find an ideal dataset that contains labels for multiple body parts, we split up and searched the internet for xray image datasets. These are the datasets we found:

The UNIFESP X-Ray Body Part Classification dataset that contains 2481 images of x-rays of 22 body parts. It is annotated in a multilabel fashion. This is the dataset we will be using for step 2.
https://www.kaggle.com/datasets/felipekitamura/unifesp-xray-bodypart-classification/

VinDr-BodyPartXR: An Open Dataset for Classification of Body Parts from DICOM X-ray Scans. With labels such as "abdominal", "pediatric", and "adult, the classes were too vague for us to create a concrete body part classifier. https://vindr.ai/datasets/bodypartxr

MURA (musculoskeletal radiographs) is a large dataset of bone X-rays. However, they only had images belonging to one of seven standard upper body parts: elbow, finger, forearm, hand, humerus, shoulder, and wrist. https://stanfordmlgroup.github.io/competitions/mura/ 

## Step 2 Multiary X-Ray Body Part Classification Model Info
Model: DenseNet

Dataset: UNIFESP X-Ray Body Part Classification

Classification: Multiary (22 classes)

Abdomen = 0

Ankle = 1

Cervical Spine = 2

Chest = 3

Clavicles = 4

Elbow = 5

Feet = 6

Finger = 7

Forearm = 8

Hand = 9

Hip = 10

Knee = 11

Lower Leg = 12

Lumbar Spine = 13

Others = 14

Pelvis = 15

Shoulder = 16

Sinus = 17

Skull = 18

Thigh = 19

Thoracic Spine = 20

Wrist = 21

Train-Test (Val) Ratio: 80:20

Hyperparameter Configuration:
- Optimizer: SGD
- No. of epochs: 5
- Batch Size: 64
- Learning Rate: 0.001

## Pre-training

It turned out that only the training set of the UNIFESP dataset was labeled, which was why we only used the images of the training set (1738 images in total). The labels were described as a numerical value from 0-21 for the 22 body parts under the "Target" column in the training csv file. Some images had more than one corresponding body part label which would make the dataset harder to work with, so we decided to remove them, leaving us with 1606 images in the dataset. We also split up our dataset of 1606 images into a 80:20 (train:test) ratio.

## Training
Attempt 1: 9 epochs

The training accuracy was extremely high (96.18%) which indicated overfitting. The test accuracy was also high (90.06%) and overfitting definitely couldn't be ruled out.
Just in case, we decided to visually examine the dataset for any duplicate images. All the images were unique, but many looked very similar in terms of their backgrounds and the bone placement, which could've increased chances of overfitting. We concluded that it would be better to train the model with a lower number of epochs (3-5).

Attempt 2: 5 epochs



## Post-Training
