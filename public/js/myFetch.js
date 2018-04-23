const getScript = (src) => {
    let s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    document.getElementsByTagName('body')[0].appendChild(s);
};

const myCreateElement = (elementType, attributes) => {
    let element = document.createElement(elementType);
    for (key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

const createReadMore = (screenName, maxId) => {
    let f = myCreateElement('form', {method:'post', id: 'readMore'});
    f.appendChild(myCreateElement('input', {type: 'hidden', name: 'screenName', value: screenName}))
    f.appendChild(myCreateElement('input', {type: 'hidden', name: 'maxId', value: maxId}));
    f.appendChild(myCreateElement('input', {type: 'hidden', name: 'reset', value: false}));
    const readMoreButton = myCreateElement('button', {class: "button is-info", type: 'submit'});
    readMoreButton.appendChild(document.createTextNode('続きを読む'));
    f.appendChild(readMoreButton);
    return f;
};

const removeHero = () => {  // remove hero if exists
    const hero = document.getElementsByClassName('hero')[0];
    if (hero) {
        hero.parentNode.removeChild(hero);
    }
};

const loadRetweets = (form) => {
    form.getElementsByTagName('button')[0].classList.add('is-loading');  // add loading animation
    const screenName = form.elements['screenName'].value;
    const reset = (form.elements['reset'].value == 'true');
    const maxId = parseInt(form.elements['maxId'].value);
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },    
        body: JSON.stringify({
            screenName: screenName,
            maxIdPrev: maxId   // int or NaN
        })
    }).then((response) => {
        removeHero();
        form.getElementsByTagName('button')[0].classList.remove('is-loading');  // remove loading animation
        return response.json();
    }).then((json) => {
        // retweets
        if (reset) {
            document.getElementById('items').innerHTML = '';
        }
        json['items'].forEach((item) => {
            let a = document.createElement('div');
            a.innerHTML = item
            document.getElementById('items').appendChild(a);
        });

        // readmore button
        const maxId = json['maxId'];
        const readMoreNode = document.getElementById('readMore');
        if (readMoreNode) {  // delete button
            readMoreNode.parentNode.removeChild(readMoreNode);
        }
        if (maxId) {  // add button
            form = createReadMore(screenName, maxId);
            document.getElementsByClassName('contents')[0].appendChild(form);
            document.getElementById('readMore').addEventListener("submit", (event) => {
                event.preventDefault();
                loadRetweets(form);
            });
        }
    }).then(() => {
        getScript('https://platform.twitter.com/widgets.js');  // render
    });
};

window.addEventListener('load', () => {
    const form = document.getElementById('readLatest');
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        loadRetweets(form);
    });
});