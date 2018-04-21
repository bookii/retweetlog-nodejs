window.addEventListener('load', () => {
    const loadRetweets = (form) => {
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
              },    
            body: JSON.stringify({
                screen_name: form.elements['screen_name'].value
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
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = 'https://platform.twitter.com/widgets.js';
            document.getElementsByTagName('body')[0].appendChild(s);
            console.log('Finished!');
        });
    };

    const form = document.getElementById('screenName');
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        loadRetweets(form);
    });
});