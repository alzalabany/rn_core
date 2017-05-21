import User from './auth/model';
import Blog from './Blog/model';
import Visit from './visits/model';
import Room from './room/model';

const reducers = [
  User,
  Blog,
  Room,
  Visit,
]

const initialState = Object.assign(
                                   {},
                                   User.initial,
                                   Blog.initial,
                                   Visit.initial,
                                   Room.initial,
                                   )
const k = Object.keys(initialState);
function rootReducer(state=initialState,action){
  let newState = false;
  for(i in reducers){
    if(reducers[i].canHandle(action) || action.type==='SETTINGS'){
      newState =  reducers[i].reducer(state, action);
    }
  }
  return (newState) ? newState : state ;
}

export default (state,action)=>{
  const n = rootReducer(state,action);
  if( k.length !== Object.keys(n).length)return initialState;

  return n;
}