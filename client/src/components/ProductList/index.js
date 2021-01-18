import React, { useEffect } from "react";
import { useQuery } from '@apollo/react-hooks';
import { UPDATE_PRODUCTS } from '../../utils/actions';
import ProductItem from "../ProductItem";
import { QUERY_PRODUCTS } from "../../utils/queries";
import spinner from "../../assets/spinner.gif"
import { idbPromise } from "../../utils/helpers";
import { useSelector, useDispatch } from 'react-redux';
const selectProducts = state => state.products;
const selectCategory = state => state;


function ProductList() {
  const SelectedProducts = useSelector(selectProducts);
  const SelectedCategory = useSelector(selectCategory);
  const dispatch = useDispatch();

  const { currentCategory } = SelectedCategory;

  const { loading, data } = useQuery(QUERY_PRODUCTS);

  useEffect(() => {
    // if there's data to be stored*
    if (data) {
      // *we will store it in the global state object*
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products
      });
  
      // *while also taking each product and saving it to IndexedDb via helper() 
      data.products.forEach((product) => {
        idbPromise('products', 'put', product);
      });
    }
    else if(!loading){
      idbPromise('products', 'get').then((products) => {
        dispatch({
          type: UPDATE_PRODUCTS,
          products: products
        });
      });
    }
  }, [data, loading, dispatch]);
  

  function filterProducts() {
    if (!currentCategory) {
      return SelectedProducts;
    }

    return SelectedProducts.filter(product => product.category._id === currentCategory);
  }

  return (
    <div className="my-2">
      <h2>Our Products:</h2>
      {SelectedProducts.length ? (
        <div className="flex-row">
            {filterProducts().map(product => (
                <ProductItem
                  key= {product._id}
                  _id={product._id}
                  image={product.image}
                  name={product.name}
                  price={product.price}
                  quantity={product.quantity}
                />
            ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      { loading ? 
      <img src={spinner} alt="loading" />: null}
    </div>
  );
}

export default ProductList;