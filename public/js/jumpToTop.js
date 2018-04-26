window.onscroll = () => {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("jumpToTop").style.display = "block";
    } else {
        document.getElementById("jumpToTop").style.display = "none";
    }
}