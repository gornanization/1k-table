import * as firebase from 'firebase'
import store from './store'

var config = {
    apiKey: 'AIzaSyAy77CMasWX4GKuE1nGmpinB8C0XybDYkA',
    authDomain: 'thousand-53a5a.firebaseapp.com',
    databaseURL: 'https://thousand-53a5a.firebaseio.com',
    projectId: 'thousand-53a5a',
    storageBucket: 'thousand-53a5a.appspot.com',
    messagingSenderId: '542599085794'
}

firebase.initializeApp(config)

export { firebase }
