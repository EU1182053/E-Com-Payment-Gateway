import React, { useState, useEffect } from "react";
import { isAuthenticated } from "../auth/helper";
import { getAllOrders } from "./helper/orderHelper";
import { getReviewsByProducts } from "./helper/reviewHelper";
import Base from "./Base";
import ReviewCard from "./ReviewCard";

const Order = () => {
  const { user, token } = isAuthenticated();
  const [orders, setOrders] = useState([]); // Orders with product details
  const [product, setProducts] = useState([]);
  const [reviews, setReviews] = useState({}); // Reviews keyed by product ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders and their reviews
  useEffect(() => {
    const fetchOrdersAndReviews = async () => {
      try {
        // step 1
        const orderData = await getAllOrders(user._id, token);

        // step 5
        if (orderData["purchases"].length > 0) {


          // Extract product IDs from orders
          const productIds = orderData.purchases.map((order) => order._id);

          // step 6
          // Fetch reviews for all product IDs
          const reviewData = await getReviewsByProducts(productIds, token);


          // step 10
          // Filter reviews based on the logged-in user's ID
          const userReviews = reviewData.reviews.filter(
            (review) => review.user_id._id === user._id
          );
          // Transform reviews into a dictionary keyed by product ID
          const reviewMap = userReviews.reduce((acc, review) => {
            if (!acc[review.product_id]) {
              acc[review.product_id] = [];
            }
            acc[review.product_id].push(review);
            return acc;
          }, {});

          setOrders(orderData.purchases);

          // step 11
          setReviews(reviewMap);
        }
        else {
          setOrders(orderData.purchases);

        }
      } catch (err) {
        setError(err.message || "Failed to fetch orders or reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndReviews();
  }, [user._id, token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Base title="Your Purchases" description="Review your purchase history">
      <div className="container">
        <h2 className="mb-4 text-center">Your Orders with Reviews</h2>
        {orders.length === 0 ? (
          <h4>No orders found</h4>
        ) : (
          <div className="row">
            {orders.map((order, index) => (
              <div className="col-md-6 mb-3" key={order._id}>
                < ReviewCard product={order} />
                <div className="card bg-dark border border-info">
                  <div className="card-header lead">Order: {order._id}</div>
                  <div className="card-body">
                    <h4>{order.name}</h4>
                    <p>Quantity: {order.quantity}</p>
                    <p>Amount: ₹{order.amount}</p>
                    <p>
                      Purchased On:{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </p>
                    <h5>Reviews:</h5>
                    {reviews[order._id] ? (
                      reviews[order._id].map((review) => (
                        <div
                          key={review._id}
                          className="alert alert-secondary"
                        >
                          <strong>{review.user_id.name}:</strong>{" "}
                          {review.rating_value}/5
                        </div>
                      ))
                    ) : (
                      <p>No reviews yet</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Base>
  );
};

export default Order;
