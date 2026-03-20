from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User

reco_bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

DIET_PLANS = {
    'underweight': {
        'label': 'Underweight (BMI < 18.5)',
        'goal': 'Healthy weight gain with nutrient density',
        'breakfast': ['Oats with full-fat milk, nuts & banana', 'Whole-grain toast with peanut butter & eggs', 'Smoothie: mango, banana, almond butter, flaxseeds'],
        'lunch': ['Brown rice + lentil dal + paneer/tofu', 'Whole-wheat roti + chickpea curry + yogurt', 'Quinoa salad with avocado, kidney beans, olive oil'],
        'dinner': ['Grilled salmon/chicken + sweet potato + greens', 'Tofu stir-fry + brown rice + sesame oil', 'Lentil soup + multigrain bread + cheese'],
        'snacks': ['Handful of mixed nuts & dates', 'Greek yogurt with honey', 'Avocado on crackers'],
        'avoid': ['Junk food and empty calories', 'Excessive caffeine', 'Processed sugars that spike insulin'],
        'supplements': ['Iron', 'Vitamin D', 'B12']
    },
    'normal': {
        'label': 'Normal BMI (18.5–24.9)',
        'goal': 'Hormonal balance & inflammation control',
        'breakfast': ['Steel-cut oats + cinnamon + walnuts + berries', 'Veggie omelette + whole-grain toast', 'Chia pudding + mixed berries + pumpkin seeds'],
        'lunch': ['Grilled chicken/tofu + quinoa + roasted vegetables', 'Brown rice + mixed vegetable curry + salad', 'Lentil soup + whole-wheat pita + cucumber salad'],
        'dinner': ['Baked salmon + steamed broccoli + brown rice', 'Stir-fried tofu + bok choy + soba noodles', 'Grilled paneer + dal + sautéed spinach'],
        'snacks': ['Apple with almond butter', 'Hummus with carrot sticks', 'Handful of walnuts'],
        'avoid': ['White bread, white rice, white pasta', 'Sugary drinks & desserts', 'Processed meats', 'Dairy in excess (may raise androgens)'],
        'supplements': ['Inositol (Myo & D-Chiro)', 'Omega-3', 'Magnesium', 'Vitamin D']
    },
    'overweight': {
        'label': 'Overweight (BMI 25–29.9)',
        'goal': 'Weight management & insulin sensitivity',
        'breakfast': ['Overnight oats (low-sugar) + flaxseeds + berries', 'Vegetable poha with peas & peanuts', 'Scrambled eggs + spinach + 1 slice whole-grain toast'],
        'lunch': ['Large salad + grilled protein (chicken/paneer/tofu)', 'Brown rice (½ cup) + sabzi + dal', 'Vegetable soup + multigrain crackers'],
        'dinner': ['Grilled fish + roasted vegetables (no rice)', 'Cauliflower rice + chicken stew', 'Palak dal + 1 roti + cucumber raita'],
        'snacks': ['Roasted chana', 'Mixed seeds (pumpkin + sunflower)', 'Green tea with a small handful of almonds'],
        'avoid': ['All refined carbs and sugar', 'Fruit juices (eat whole fruit instead)', 'Fried foods', 'Alcohol', 'High-GI foods'],
        'supplements': ['Berberine', 'Chromium', 'Vitamin D', 'Inositol']
    },
    'obese': {
        'label': 'Obese (BMI ≥ 30)',
        'goal': 'Significant weight loss & insulin resistance reversal',
        'breakfast': ['Moong dal chilla with mint chutney', 'Egg white omelette + half avocado + black coffee', 'Low-sugar smoothie: spinach, cucumber, ginger, lemon'],
        'lunch': ['Big bowl salad with leafy greens + lean protein + olive oil', 'Cauliflower rice + grilled chicken/fish', 'Mixed vegetable soup + boiled eggs'],
        'dinner': ['Zucchini noodles + tomato-basil sauce + turkey/paneer', 'Stir-fried vegetables + tofu (no noodles or rice)', 'Lentil salad + steamed vegetables'],
        'snacks': ['Cucumber + hummus', 'Small portion of walnuts (10–12)', 'Herbal tea'],
        'avoid': ['All sugary foods, including natural sweeteners', 'All refined carbs', 'Dairy fat', 'Fast food entirely', 'Large portions at dinner'],
        'supplements': ['Vitamin D (high dose)', 'Inositol', 'Alpha-lipoic acid', 'Omega-3']
    }
}

EXERCISE_PLANS = {
    'beginner': {
        'label': 'Beginner (just starting out)',
        'weekly_goal': '3–4 days per week',
        'exercises': [
            {'name': 'Walking', 'duration': '30 min', 'frequency': 'Daily', 'benefit': 'Improves insulin sensitivity, low impact', 'icon': '🚶‍♀️'},
            {'name': 'Gentle Yoga', 'duration': '20–30 min', 'frequency': '3x/week', 'benefit': 'Reduces cortisol, balances hormones', 'icon': '🧘‍♀️'},
            {'name': 'Stretching', 'duration': '15 min', 'frequency': 'Daily', 'benefit': 'Reduces stiffness and stress', 'icon': '🤸‍♀️'},
            {'name': 'Light Cycling', 'duration': '20 min', 'frequency': '3x/week', 'benefit': 'Burns fat, gentle on joints', 'icon': '🚴‍♀️'},
        ]
    },
    'intermediate': {
        'label': 'Intermediate (some experience)',
        'weekly_goal': '4–5 days per week',
        'exercises': [
            {'name': 'Brisk Walking / Jogging', 'duration': '40 min', 'frequency': '5x/week', 'benefit': 'Cardiovascular health & weight management', 'icon': '🏃‍♀️'},
            {'name': 'Strength Training', 'duration': '30–40 min', 'frequency': '3x/week', 'benefit': 'Builds muscle, boosts metabolism, lowers androgens', 'icon': '💪'},
            {'name': 'Power Yoga / Pilates', 'duration': '45 min', 'frequency': '2x/week', 'benefit': 'Core strength, hormone balance', 'icon': '🧘‍♀️'},
            {'name': 'Swimming', 'duration': '30 min', 'frequency': '2x/week', 'benefit': 'Full-body, anti-inflammatory', 'icon': '🏊‍♀️'},
            {'name': 'Meditation', 'duration': '10 min', 'frequency': 'Daily', 'benefit': 'Cortisol reduction, mental clarity', 'icon': '🧠'},
        ]
    },
    'advanced': {
        'label': 'Advanced (regular exerciser)',
        'weekly_goal': '5–6 days per week',
        'exercises': [
            {'name': 'HIIT Training', 'duration': '25–30 min', 'frequency': '3x/week', 'benefit': 'Powerful fat burn & insulin sensitivity boost', 'icon': '🔥'},
            {'name': 'Heavy Strength Training', 'duration': '45–60 min', 'frequency': '3x/week', 'benefit': 'Testosterone regulation, muscle mass', 'icon': '🏋️‍♀️'},
            {'name': 'Running', 'duration': '30–45 min', 'frequency': '3x/week', 'benefit': 'Cardio fitness, endorphin boost', 'icon': '🏃‍♀️'},
            {'name': 'Yin Yoga', 'duration': '30 min', 'frequency': '2x/week', 'benefit': 'Deep recovery, hormone reset', 'icon': '🧘'},
            {'name': 'Mindfulness Meditation', 'duration': '15–20 min', 'frequency': 'Daily', 'benefit': 'Adrenal recovery, mental health', 'icon': '🌸'},
        ]
    }
}


def bmi_to_diet_key(bmi):
    if bmi < 18.5:
        return 'underweight'
    elif bmi < 25:
        return 'normal'
    elif bmi < 30:
        return 'overweight'
    else:
        return 'obese'


def bmi_to_exercise_level(bmi):
    if bmi >= 30:
        return 'beginner'
    elif bmi >= 25:
        return 'intermediate'
    else:
        return 'intermediate'


@reco_bp.route('/', methods=['GET'])
@jwt_required()
def get_recommendations():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    bmi = user.bmi or 22.0
    diet_key = bmi_to_diet_key(bmi)
    exercise_level = bmi_to_exercise_level(bmi)

    return jsonify({
        'bmi': bmi,
        'diet': DIET_PLANS[diet_key],
        'exercise': EXERCISE_PLANS[exercise_level],
        'all_exercises': list(EXERCISE_PLANS.values())
    }), 200
