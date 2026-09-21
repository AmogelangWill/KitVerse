import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";
import "./ReviewsDrawer.css";

// Drawer modal presenting product reviews and a submission form
function ReviewsDrawer({ isOpen, onClose, reviews, tshirtId, onReviewAdded }) {
    const { user, setIsAuthOpen } = useAuth();
    const { showToast } = useToast();
    
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handles the submission of a new review to the API
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            showToast("Please select a star rating.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("https://kitverse-production.up.railway.app/api/Review", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    tShirtId: parseInt(tshirtId),
                    userId: user.userId,
                    stars: rating,
                    comment: comment.trim()
                })
            });

            if (res.ok) {
                showToast("Review submitted successfully!", "success");
                setRating(0);
                setComment("");
                onReviewAdded(); // Refresh reviews list
            } else {
                const data = await res.json().catch(() => ({}));
                showToast(data.message || "Failed to submit review.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Network error submitting review.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={`ReviewsOverlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`ReviewsDrawer ${isOpen ? 'open' : ''}`}>
                <div className="ReviewsHeader">
                    <h3>Reviews</h3>
                    <button className="ReviewsCloseBtn" onClick={onClose} aria-label="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <div className="ReviewsContent">
                    {/* Add Review Form */}
                    {user ? (
                        <form className="AddReviewForm" onSubmit={handleSubmit}>
                            <h4>Write a Review</h4>
                            <div className="StarSelect" onMouseLeave={() => setHoverRating(0)}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button 
                                        key={star} 
                                        type="button"
                                        className={`StarSelectBtn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onClick={() => setRating(star)}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 14 13" fill="currentColor">
                                            <path d="M13.0813 5.32656C13.0265 5.15429 12.921 5.00258 12.7785 4.89132C12.636 4.78007 12.4632 4.71447 12.2828 4.70312L9.0344 4.47891L7.83127 1.44375C7.76557 1.27663 7.65122 1.13307 7.50302 1.03167C7.35482 0.93027 7.17959 0.875691 7.00002 0.875C6.82045 0.875691 6.64522 0.93027 6.49702 1.03167C6.34882 1.13307 6.23447 1.27663 6.16877 1.44375L4.94377 4.49531L1.71721 4.70312C1.53701 4.71521 1.36459 4.78108 1.22225 4.89223C1.0799 5.00338 0.974186 5.15468 0.91877 5.32656C0.861862 5.50108 0.858537 5.68865 0.909224 5.86508C0.95991 6.0415 1.06228 6.1987 1.20314 6.31641L3.68596 8.41641L2.94768 11.3203C2.8966 11.5168 2.90579 11.724 2.97406 11.9152C3.04233 12.1063 3.16652 12.2725 3.33049 12.3922C3.48965 12.5064 3.67927 12.5706 3.87509 12.5764C4.07091 12.5823 4.26402 12.5295 4.42971 12.425L6.99455 10.8008H7.00549L9.76721 12.5453C9.90887 12.6374 10.074 12.6867 10.243 12.6875C10.3809 12.6864 10.5168 12.6537 10.6401 12.5919C10.7635 12.5301 10.871 12.4409 10.9544 12.331C11.0379 12.2211 11.095 12.0936 11.1215 11.9582C11.1479 11.8228 11.143 11.6832 11.1071 11.55L10.325 8.37266L12.7969 6.31641C12.9378 6.1987 13.0401 6.0415 13.0908 5.86508C13.1415 5.68865 13.1382 5.50108 13.0813 5.32656Z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                            <textarea 
                                className="ReviewTextarea" 
                                rows="3" 
                                placeholder="What did you think about this product?"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                            />
                            <button type="submit" className="SubmitReviewBtn" disabled={isSubmitting}>
                                {isSubmitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
                            </button>
                        </form>
                    ) : (
                        <div className="SignInPrompt">
                            <p>Please sign in to write a review.</p>
                            <button onClick={() => setIsAuthOpen(true)} className="SubmitReviewBtn" style={{marginTop: '10px'}}>
                                SIGN IN
                            </button>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="ReviewsList">
                        {reviews.length === 0 ? (
                            <p style={{color: '#6b7280', textAlign: 'center', marginTop: '20px'}}>
                                No reviews yet. Be the first to review!
                            </p>
                        ) : (
                            reviews.map((rev, index) => (
                                <div key={index} className="ReviewItem">
                                    <div className="ReviewHeader">
                                        <div className="ReviewStars">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <svg key={star} className={`ReviewStar ${rev.stars >= star ? 'filled' : ''}`} width="14" height="14" viewBox="0 0 14 13" fill="currentColor">
                                                    <path d="M13.0813 5.32656C13.0265 5.15429 12.921 5.00258 12.7785 4.89132C12.636 4.78007 12.4632 4.71447 12.2828 4.70312L9.0344 4.47891L7.83127 1.44375C7.76557 1.27663 7.65122 1.13307 7.50302 1.03167C7.35482 0.93027 7.17959 0.875691 7.00002 0.875C6.82045 0.875691 6.64522 0.93027 6.49702 1.03167C6.34882 1.13307 6.23447 1.27663 6.16877 1.44375L4.94377 4.49531L1.71721 4.70312C1.53701 4.71521 1.36459 4.78108 1.22225 4.89223C1.0799 5.00338 0.974186 5.15468 0.91877 5.32656C0.861862 5.50108 0.858537 5.68865 0.909224 5.86508C0.95991 6.0415 1.06228 6.1987 1.20314 6.31641L3.68596 8.41641L2.94768 11.3203C2.8966 11.5168 2.90579 11.724 2.97406 11.9152C3.04233 12.1063 3.16652 12.2725 3.33049 12.3922C3.48965 12.5064 3.67927 12.5706 3.87509 12.5764C4.07091 12.5823 4.26402 12.5295 4.42971 12.425L6.99455 10.8008H7.00549L9.76721 12.5453C9.90887 12.6374 10.074 12.6867 10.243 12.6875C10.3809 12.6864 10.5168 12.6537 10.6401 12.5919C10.7635 12.5301 10.871 12.4409 10.9544 12.331C11.0379 12.2211 11.095 12.0936 11.1215 11.9582C11.1479 11.8228 11.143 11.6832 11.1071 11.55L10.325 8.37266L12.7969 6.31641C12.9378 6.1987 13.0401 6.0415 13.0908 5.86508C13.1415 5.68865 13.1382 5.50108 13.0813 5.32656Z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="ReviewUser">{rev.user?.userName || "Verified Buyer"}</span>
                                    </div>
                                    {rev.comment && <p className="ReviewComment">{rev.comment}</p>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ReviewsDrawer;
