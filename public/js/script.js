// window.addEventListener('load', () => {
//     const loadRetweets = (screenName) => {
//         const request = new XMLHttpRequest();
//         const formData = new FormData();
//         formData.append('screenName', screenName);
//         request.open('POST', '/');
//         request.addEventListener('load', (event) => {
//             alert(event.target.statusText);
//         });
//         request.addEventListener('error', () => {
//             alert('error');
//         });
//         request.send(formData);
//     };

//     const form = document.getElementById('screenName');
//     form.addEventListener("submit", (event) => {
//         event.preventDefault();
//         loadRetweets(document.forms.screenName.screen_name.value);
//     });
// });

window.addEventListener('load', () => {
    const loadRetweets = (form) => {
        console.log(form.elements['screen_name'].value);
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
            console.log(json['items']);
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