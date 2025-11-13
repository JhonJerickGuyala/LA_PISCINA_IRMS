const bcrypt = require('bcrypt');

const plain = 'lapiscina_owner';
const hash = '$2b$10$VR8wZu.h84AXlpXnLG68O.jVyDtQ.QAX1qhmXBFoHnfvigFFMwUnG';

bcrypt.compare(plain, hash).then(result => {
    console.log('Match?', result);
});
