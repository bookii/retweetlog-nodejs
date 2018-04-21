const getScript = (src) => {
    let s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    document.getElementsByTagName('body')[0].appendChild(s);
};

const myCreateElement = (elementType, attributes) => {
    let element = document.createElement(elementType)
    for (key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

const createReadMore = (screenName, maxId) => {
    let f = myCreateElement('form', {method:'post', id: 'readMore'});
    f.appendChild(myCreateElement('input', {type: 'hidden', name: 'screenName', value: screenName}))
    f.appendChild(myCreateElement('input', {type: 'hidden', name: 'maxId', value: maxId}));
    f.appendChild(myCreateElement('input', {type: 'submit', value: 'Read More'}));
    return f;
};

const loadRetweets = (form) => {
    const screenName = form.elements['screenName'].value;
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },    
        body: JSON.stringify({
            screen_name: screenName
        })
    }).then((response) => {
        return response.json();
    }).then((json) => {
        document.getElementById('items').innerHTML = '';
        json['items'].forEach((item) => {
            let a = document.createElement('div');
            a.innerHTML = item
            document.getElementById('items').appendChild(a);
        });
    }).then(() => {
        getScript('https://platform.twitter.com/widgets.js');
        if (!document.getElementById('readMore')) {
            console.log(document.getElementsByTagName('body')[0]);
            document.getElementsByTagName('body')[0].appendChild(createReadMore(screenName, null));
        }
        console.log('Finished!');
    });
};

window.addEventListener('load', () => {
    const form = document.getElementById('readLatest');
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        loadRetweets(form);
    });
});