const initialState = {
  showModal: false,
  products: [],
  isLoading: false,
  isError: false,
  currentProduct:undefined
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SHOP_PAGE_SET_STATE': {
      return {
        ...state,
        ...action.payload,
      };
    }
    case 'SHOP_PAGE_RESET_STATE': {
      return initialState;
    }
    default:
      return state;
  }
}

export default reducer;
