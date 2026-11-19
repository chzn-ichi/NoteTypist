export type Note = {
  id: string;
  title: string;
  text: string;
};

export const SAMPLE_NOTES: Note[] = [
  {
    id: "what-is-ai",
    title: "What is AI?",
    text: "Artificial intelligence is the field of building computer systems that can perform tasks that normally need human intelligence, such as understanding language, recognizing images, and making decisions. Most AI today is narrow, meaning it is designed for one specific job, like translating text or recommending videos. A system that could match a human across every kind of task is called artificial general intelligence, and it does not exist yet.",
  },
  {
    id: "machine-learning",
    title: "Machine learning",
    text: "Machine learning is a way of building AI by letting a computer learn from examples instead of following rules written by a programmer. The program is shown a large amount of data, finds patterns in it, and uses those patterns to make predictions about new data. There are three main types: supervised learning uses labeled examples, unsupervised learning finds structure in unlabeled data, and reinforcement learning learns by trial and error with rewards.",
  },
  {
    id: "neural-networks",
    title: "Neural networks",
    text: "A neural network is a machine learning model loosely inspired by the brain. It is made of layers of simple units called neurons, and each connection between them has a number called a weight. Data enters the input layer, passes through hidden layers, and produces an answer at the output layer. During training, the network compares its answer with the correct one and adjusts its weights a little at a time to reduce the error.",
  },
  {
    id: "llms",
    title: "Large language models",
    text: "A large language model, or LLM, is an AI system trained on huge amounts of text to predict the next token in a sequence. A token is a small piece of text, often a word or part of a word. By repeating this prediction many times, the model can write sentences, answer questions, and summarize documents. LLMs can sound confident while being wrong, so their answers should be checked.",
  },
];