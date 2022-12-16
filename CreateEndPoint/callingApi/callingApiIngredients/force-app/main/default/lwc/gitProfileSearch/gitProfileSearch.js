import { LightningElement } from 'lwc';

const GITHUB_URL = 'https://api.github.com/users/';
export default class GitProfileSearch extends LightningElement {
username;
user ={}

get userPopulated(){
    return this.user && this.user.id;
}

get githubURL(){
    return 'https://www.github.com/' + this.username;
}

updateUsername(event){
    this.username = event.target.value;
}

getGithubStats(){
    if(this.username){
        this.user = {};
        fetch(GITHUB_URL + this.username).then(response => {
            console.log(response);
            if(response.ok){
                return response.json();
            }else{
                throw Error(response);
            }

        }).then(githubUser => {
            console.log(githubUser);
            this.user ={
                id: githubUser.id,
                name: githubUser.name,
                image: githubUser.avtar_url,
                blog: githubUser.blog,
                about: githubUser.bio,
                respos: githubUser.public_gists,
                followers: githubUser.followers

            };
        }).catch(error => console.log(error))
    } else{
        alert('please specify a username');
    }
}
}