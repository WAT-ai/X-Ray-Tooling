## Stage 1 Hyperparameter Tuning Results
Three out of ten models that were vastly different in terms of hyperparameter configurations resulted in high accuracy (>70%) while the others resulted in (<50%).

The three "successful" models were tuned as follows:

Model 1: 

Num of Epochs: 5	Batch Size: 32	Optimizer: SGD	Learning Rate: 0.001	Weight Decay: 0.001

Model 2:

Num of Epochs: 3	Batch Size: 64	Optimizer: Adam	Learning Rate: 0.0001	Weight Decay: 0.001

Model 9:

Num of Epochs: 5	Batch Size: 32	Optimizer: Adam	Learning Rate: 0.0001	Weight Decay: 0.1

From these results, it seems like batch size didn't matter as there were successful models with both batch sizes. All optimizers except for RMSprop had produced at least one good result; all learning rates except for 0.01 produced at least one good result; and all weight decays except 0.01 produced at least one good result.

## Stage 2 Hyperparameter Tuning Results

I set a fixed seed in models 1, 2, and 9 to ensure that initialization of weights are consistent amongst all the models to further compare the three. Based on testing accuracy results, model 9 was the best. 

## Stage 3 Hyperparameter Tuning Results
We decided to test two more models (11 and 12). Model 11 was built off of the highest accuracy model (9) and tested to check the hypothesis that a learning rate of 0.01 would ruin its accuracy. The hypothesis was deemed to be correct as model 11 had bad results. Model 12 was also tuned with the same hyperparameter configurations as model 9 but with Adagrad as its optimizer. From the results, we see that Adagrad performed worse than Adam. Thus, Adam is still the best optimizer for this task.