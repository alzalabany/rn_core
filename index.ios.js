import react from 'react';
import { AsyncStorage } from 'react-native';
import { Provider } from 'react-redux';
import { Navigation } from 'react-native-navigation';

import BlogScreen from './src/Blog/screen';
import BlogCreateModal from './src/Blog/modal';
import HomeScreen from './src/Home';
import MoreScreen from './src/more/screen';
import AuthScreen from './src/auth/screen';
import CreateVisit from './src/visits/CreateVisit';
import EditVisit from './src/visits/EditVisit';
import RoomsSettings from './src/Home/roomsSettings'

import api from './src/api';
import User from './src/auth/model';
import {iconsMap,iconsLoaded} from './src/icons';
import { configStore } from './src/icons';

import { compose, applyMiddleware, createStore } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist'
import thunk from 'redux-thunk';
import rootReducer from './src/rootReducer';

export const store = createStore( rootReducer,
                                undefined,
                                compose(
                                        applyMiddleware(thunk),
                                        autoRehydrate()
                                      )
                              );

export const persistor = new Promise((resolve, reject) => {
  persistStore(store, {storage: AsyncStorage},resolve);
})


const navigatorStyle = {
  // Common
  navBarTextColor: '#FFF', // change the text color of the title (remembered across pushes)
  //navBarTextFontFamily: 'font-name', // Changes the title font
  navBarBackgroundColor: 'purple', // change the background color of the nav bar (remembered across pushes)

  navBarButtonColor: '#FFF', // Change color of nav bar buttons (eg. the back button) (remembered across pushes)

  navBarHidden: false, // make the nav bar hidden
  navBarHideOnScroll: false, // make the nav bar hidden only after the user starts to scroll
  navBarTranslucent: false, // make the nav bar semi-translucent, works best with drawUnderNavBar:true
  navBarTransparent: false, // make the nav bar transparent, works best with drawUnderNavBar:true,
  navBarNoBorder: false, // hide the navigation bar bottom border (hair line). Default false
  drawUnderNavBar: false, // draw the screen content under the nav bar, works best with navBarTranslucent:true
  drawUnderTabBar: false, // draw the screen content under the tab bar (the tab bar is always translucent)
  statusBarBlur: false, // blur the area under the status bar, works best with navBarHidden:true
  navBarBlur: false, // blur the entire nav bar, works best with drawUnderNavBar:true
  tabBarHidden: false, // make the screen content hide the tab bar (remembered across pushes)
  statusBarHideWithNavBar: false, // hide the status bar if the nav bar is also hidden, useful for navBarHidden:true
  statusBarHidden: false, // make the status bar hidden regardless of nav bar state
  statusBarTextColorScheme: 'dark', // text color of status bar, 'dark' / 'light' (remembered across pushes)
  statusBarTextColorSchemeSingleScreen: 'light', // same as statusBarTextColorScheme but does NOT remember across pushes
  navBarSubtitleColor: 'white', // subtitle color
  screenBackgroundColor: '#F1F3FA', // Default screen color, visible before the actual react view is rendered
  orientation: 'portrait', // Sets a specific orientation to a modal and all screens pushed to it. Default: 'auto'. Supported values: 'auto', 'landscape', 'portrait'

  // iOS only
  disabledBackGesture: false, // default: false. Disable the back gesture (swipe gesture) in order to pop the top screen. 
  //screenBackgroundImageName: '<name of image in Images.xcassets>', // Optional. default screen background image.

  navBarButtonFontSize: 20, // Change font size nav bar buttons (eg. the back button) (remembered across pushes)
  navBarButtonFontWeight: '500', // Change font weight nav bar buttons (eg. the back button) (remembered across pushes)

  navBarLeftButtonFontSize: 17, // Change font size of left nav bar button
  navBarLeftButtonColor: 'red', // Change color of left nav bar button
  navBarLeftButtonFontWeight: '400', // Change font weight of left nav bar button

  navBarRightButtonFontSize: 17, // Change font size of right nav bar button
  navBarRightButtonColor: 'blue', // Change color of right nav bar button
  navBarRightButtonFontWeight: '600', // Change font weight of right nav bar button

  // Android only
  //navigationBarColor: '#000000', // change the background color of the bottom native navigation bar.
  //navBarTitleTextCentered: true, // default: false. centers the title.
  //topBarElevationShadowEnabled: false, // default: true. Disables TopBar elevation shadow on Lolipop and above
  //statusBarColor: '#000000', // change the color of the status bar.
  //collapsingToolBarImage: "http://lorempixel.com/400/200/", // Collapsing Toolbar image.
  //collapsingToolBarImage: require('../../img/topbar.jpg'), // Collapsing Toolbar image. Either use a url or require a local image.
  //collapsingToolBarCollapsedColor: '#0f2362', // Collapsing Toolbar scrim color.
}

Navigation.registerComponent('ivf.BlogScreen', () => BlogScreen,store, Provider);
Navigation.registerComponent('ivf.HomeScreen', () => HomeScreen,store, Provider);
Navigation.registerComponent('ivf.MoreScreen', () => MoreScreen,store, Provider);
Navigation.registerComponent('ivf.AuthScreen', () => AuthScreen,store, Provider);
Navigation.registerComponent('ivf.CreateVisit', () => CreateVisit,store, Provider);
Navigation.registerComponent('ivf.EditVisit', () => EditVisit,store, Provider);
Navigation.registerComponent('ivf.create.blog', () => BlogCreateModal,store, Provider);
Navigation.registerComponent('ivf.RoomsSetting', () => RoomsSettings,store, Provider);
Navigation.registerComponent('ivf.Profile', () => RoomsSettings, store, Provider);
Navigation.registerComponent('ivf.autocomplete', () => RoomsSettings, store, Provider);

new Promise.all(persistor,iconsLoaded).then(r=>new App(r));

class App{
  constructor(){
    this.root = 'none';
    this.user_id = NaN;
    this.runApp = this.runApp.bind(this);
    this.runLogin = this.runLogin.bind(this);
    store.subscribe(r=>this.letsGo.bind(this)(User.selectCurrentUserId(store.getState())))
    Navigation.setOnNavigatorEvent((event)=>{
      console.log('new event',event)
    });
  }
  letsGo(id){
    if(this.user_id === id)return;
    this.user_id = id;
    return (this.user_id) ? this.runApp() : this.runLogin();
  }
  runLogin(){
    if(this.root === 'login')return;
    api.setHeader('Authorization','Bearer ');
    this.root = 'login';
    Navigation.startSingleScreenApp({
             screen: {
               screen: 'ivf.AuthScreen',
               title: 'Login',
               navigatorStyle:{ navBarHidden: true },
             },
             passProps: {
              onSuccess : user =>store.dispatch(User.setUser(user))
             }
            });
  }
  runApp(){
    if(this.root === 'app')return;
    this.root = 'app';
    api.setHeader('Authorization','Bearer '+User.selectToken(store.getState()));
    const navigatorButtons = {
      leftButtons: [{ // buttons for the right side of the nav bar (optional)
        title: 'Logout', // if you want a textual button
        icon: iconsMap['ios-person'], // if you want an image button
        id: 'logout', // id of the button which will pass to your press event handler. See the section bellow for Android specific button ids
        disabled: false, // optional, used to disable the button (appears faded and doesn't interact)
        disableIconTint: false, // optional, by default the image colors are overridden and tinted to navBarButtonColor, set to true to keep the original image colors
        buttonColor: 'white', // Set color for the button (can also be used in setButtons function to set different button style programatically)
        buttonFontSize: 14, // Set font size for the button (can also be used in setButtons function to set different button style programatically)
        buttonFontWeight: '600', // Set font weight for the button (can also be used in setButtons function to set different button style programatically)
      }],
      rightButtons: [] // buttons for the left side of the nav bar (optional)
    };
    const passProps = {logout    : none =>store.dispatch(User.logout())}
    Navigation.startTabBasedApp({
      animationType: 'slide-down',
      title: 'Redux Example',
      tabsStyle:{
        tabBarBackgroundColor: 'purple',
        tabBarButtonColor: '#ffffff',
        tabBarSelectedButtonColor: 'white',
        tabBarTranslucent: false,
      },
      tabs: [
        {
          label: 'News',
          screen: 'ivf.BlogScreen', // this is a registered name for a screen
          icon: iconsMap["ios-desktop-outline"],
          selectedIcon: iconsMap["ios-desktop"],
          //selectedIcon: require('../img/one_selected.png'), // iOS only
          title: 'News',
          passProps,
          navigatorStyle,
          navigatorButtons
        },
        {
          label: 'Home',
          screen: 'ivf.HomeScreen',
          icon: iconsMap["ios-calendar-outline"],
          selectedIcon: iconsMap["ios-calendar"],
          //selectedIcon: require('../img/two_selected.png'), // iOS only
          title: 'Home',
          passProps,
          navigatorStyle,
          navigatorButtons
        },
        {
          label: 'About',
          screen: 'ivf.MoreScreen',
          icon: iconsMap["ios-more-outline"],
          selectedIcon: iconsMap["ios-more"],
          //selectedIcon: require('../img/two_selected.png'), // iOS only
          title: 'Madina Women Hospital',
          passProps,
          navigatorStyle,
          navigatorButtons
        },

      ]
      });
  }

}
