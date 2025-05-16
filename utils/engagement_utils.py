import random

def get_engagement_recommendation(engagement_score, attention_score, confusion_level):
    """
    Generate teaching recommendations based on engagement metrics.
    
    Args:
        engagement_score (float): Overall engagement score (0-1)
        attention_score (float): Attention level score (0-1)
        confusion_level (float): Confusion level score (0-1)
        
    Returns:
        str: A teaching recommendation
    """
    # Low engagement
    if engagement_score < 0.4:
        recommendations = [
            "Student appears disengaged. Try using more interactive elements or asking direct questions.",
            "Engagement is low. Consider changing the pace or introducing a collaborative activity.",
            "Try incorporating real-world examples or applications to increase interest.",
            "Consider using multimedia or visual aids to re-engage the student."
        ]
        return random.choice(recommendations)
    
    # High confusion
    elif confusion_level > 0.6:
        recommendations = [
            "Student seems confused. Try breaking down the concept into smaller, more manageable parts.",
            "High confusion detected. Consider revisiting prerequisite concepts before continuing.",
            "Try using a different explanation approach or analogy to clarify the concept.",
            "Consider using visual representations or diagrams to explain the concept differently."
        ]
        return random.choice(recommendations)
    
    # Low attention
    elif attention_score < 0.4:
        recommendations = [
            "Student's attention is wandering. Consider a brief break or a change of topic.",
            "Try posing a thought-provoking question to recapture attention.",
            "Consider incorporating a brief physical activity to refresh focus.",
            "Try connecting the current topic to the student's personal interests."
        ]
        return random.choice(recommendations)
    
    # Everything looks good
    else:
        recommendations = [
            "Student appears engaged and following the material well.",
            "Good engagement levels. Continue with the current teaching approach.",
            "Student is attentive and understanding the material. Consider introducing more challenging content.",
            "Engagement is strong. This might be a good time to check for deeper understanding with application questions."
        ]
        return random.choice(recommendations)