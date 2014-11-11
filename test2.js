var natural = require('natural'),
  classifier = new natural.BayesClassifier();

classifier.addDocument('i am long qqqq', 'buy');
classifier.addDocument('buy the qs', 'buy');
classifier.addDocument('short gold', 'sell');
classifier.addDocument('sell gold', 'sell');

classifier.train();

console.log(classifier.classify('i am short silver'));

classifier.addDocument('check out q', 'buy');
classifier.addDocument('check out silver', 'buy');
classifier.addDocument('check out gold', 'buy');

classifier.train();
console.log(classifier.classify('check out gold'));