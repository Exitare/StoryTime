import {Component, OnDestroy, OnInit} from '@angular/core';
import {SentencesService} from "../../core/services/sentence.service";
import {Subscription} from "rxjs";
import {Age, Sentence} from "../../core/models";
import {SettingsService} from "../../core/services/settings.service";
import * as tf from '@tensorflow/tfjs';

interface ISentenceForCategory {
    category: string;
    sentence: Sentence;
}


@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {
    subscriptions$: Subscription[] = [];
    availableCategories: string[] = [];
    sentenceForCategory: ISentenceForCategory[] = [];
    colors: string[] = []

    constructor(private sentenceService: SentencesService, private settingsService: SettingsService) {
        this.subscriptions$.push(this.settingsService.enteredAgeChanged$.subscribe(async () => {
            await this.loadData();
        }));
        this.subscriptions$.push(this.sentenceService.loadAvailableCategories().subscribe((categories) => this.availableCategories = categories));

        this.createModel();
    }

    async ngOnInit() {
        await this.loadData();
    }

    async ionViewDidEnter() {
        if (this.sentenceForCategory.length === 0) {
            await this.loadData();
        }
    }


    async loadData() {
        const userAge = await this.settingsService.getAge();

        this.colors = this.availableCategories.map(() => this.getRandomColor());
        // load a sentence for each category
        this.availableCategories.forEach((category) => {
            let age: Age = {
                min: userAge - 1,
                max: userAge + 1
            }
            if (userAge == 0) {
                age = {
                    min: 0,
                    max: 99
                }
            }
            this.subscriptions$.push(this.sentenceService.getRandomSentence(age, [category]).subscribe((sentence) => {
                this.sentenceForCategory.push({category, sentence});
            }));
        });
    }


    ngOnDestroy() {
        this.subscriptions$.forEach((subscription) => subscription.unsubscribe());
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        // only accept darker colors
        for (let i = 0; i < 3; i++) {
            color += letters[Math.floor(Math.random() * 10)];
        }
        return color;
    }


    createModel() {
        // Create a sequential model
        // Define a model for linear regression.
        const model = tf.sequential();
        model.add(tf.layers.dense({units: 3, activation: 'linear', inputShape: [4]   }));
        model.add(tf.layers.dense({units: 2, activation: 'linear', inputShape: [3]   }));
        model.add(tf.layers.dense({units: 1, activation: 'linear', inputShape: [2]   }));


// Prepare the model for training: Specify the loss and the optimizer.
        model.compile({loss: 'meanSquaredError', optimizer: 'adam'});01
0
// Generate some synthetic data for training.


        const example = [[0, 0, 0, 1], [0, 0, 1, 0]]


        // create 2d tensor from 2d array
        const xs = tf.tensor2d(example, [2, 4]);
        const ys = tf.tensor2d([[0], [1]]);

// Train the model using the data.
        model.fit(xs, ys).then(() => {
            // Use the model to do inference on a data point the model hasn't seen before:
            const resultTensor: tf.Tensor = model.predict(tf.tensor2d([0, 0, 0, 1], [1, 4])) as tf.Tensor;
            // get the result from the tensor
            const predictedValue = resultTensor.dataSync();
            console.log(predictedValue);
        });
    }

    async createRecommenderModel(){

        const data = []
        // Assuming tf is already imported as TensorFlow.js library
        const model = tf.sequential();

// Define model architecture (Example with a simple dense network)
        model.add(tf.layers.dense({units: 128, activation: 'relu', inputShape: [10]}));
        model.add(tf.layers.dense({units: 64, activation: 'relu'}));
        model.add(tf.layers.dense({units: 10, activation: 'softmax'}));

// Compile the model
        model.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

// Prepare your data as tensors
        const xs = tf.tensor2d(data.inputs); // Convert input data to tensor
        const ys = tf.tensor2d(data.labels); // Convert labels data to tensor

// Train the model
        await model.fit(xs, ys, {
            epochs: 20,
            batchSize: 32,
            validationSplit: 0.2,
        });

    }


}
