from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import re

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api/chatbot')

# PCOS Knowledge Base
KB = [
    {
        'keywords': ['what is pcos', 'define pcos', 'pcos meaning', 'polycystic'],
        'response': (
            "**PCOS (Polycystic Ovary Syndrome)** is one of the most common hormonal disorders affecting women of reproductive age.\n\n"
            "It is characterized by:\n"
            "• **Irregular or absent periods** due to infrequent ovulation\n"
            "• **Elevated androgen levels** (male hormones) causing acne, excess hair growth, and hair thinning\n"
            "• **Polycystic ovaries** — enlarged ovaries with small follicles\n\n"
            "PCOS affects approximately **1 in 10 women** worldwide. It is manageable but not curable. "
            "Early detection and lifestyle changes can significantly improve symptoms."
        )
    },
    {
        'keywords': ['symptoms', 'signs', 'how do i know', 'indication'],
        'response': (
            "**Common PCOS Symptoms:**\n\n"
            "🔴 **Menstrual Issues:** Irregular, absent, or very heavy periods\n"
            "🔴 **Hormonal:** Excess facial/body hair (hirsutism), acne, oily skin\n"
            "🔴 **Weight:** Difficulty losing weight, weight gain especially around the abdomen\n"
            "🔴 **Skin:** Dark patches (acanthosis nigricans) on neck, armpits, groin\n"
            "🔴 **Fertility:** Difficulty getting pregnant due to irregular ovulation\n"
            "🔴 **Mental Health:** Anxiety, depression, mood swings\n\n"
            "⚠️ *Not all women with PCOS have all symptoms. A diagnosis requires medical evaluation.*"
        )
    },
    {
        'keywords': ['diet', 'food', 'eat', 'nutrition', 'meal'],
        'response': (
            "**PCOS-Friendly Diet Tips:**\n\n"
            "✅ **Foods to Eat:**\n"
            "• High-fiber foods: broccoli, cauliflower, leafy greens\n"
            "• Lean proteins: chicken, tofu, eggs, lentils\n"
            "• Anti-inflammatory: turmeric, ginger, berries, olive oil\n"
            "• Low-GI carbs: brown rice, quinoa, oats, sweet potato\n"
            "• Healthy fats: avocado, nuts, seeds, fatty fish\n\n"
            "❌ **Foods to Avoid:**\n"
            "• Refined carbs: white bread, white rice, pasta\n"
            "• Sugary drinks and sweets\n"
            "• Processed and fast food\n"
            "• Excess dairy (may raise insulin & androgens)\n"
            "• Alcohol\n\n"
            "💡 *Check the Diet & Exercise section for your personalized meal plan!*"
        )
    },
    {
        'keywords': ['exercise', 'workout', 'yoga', 'fitness', 'walk', 'gym'],
        'response': (
            "**PCOS-Friendly Exercise Recommendations:**\n\n"
            "🏃‍♀️ **Cardio (3–5x/week):** Walking, jogging, cycling, swimming — improves insulin sensitivity\n"
            "💪 **Strength Training (2–3x/week):** Boosts metabolism and helps regulate testosterone\n"
            "🧘 **Yoga:** Reduces cortisol and stress hormones — particularly beneficial for PCOS\n"
            "🔥 **HIIT (2x/week):** Short bursts of high-intensity exercise — highly effective for fat loss\n"
            "🧠 **Meditation (daily):** Lowers stress which directly affects hormone balance\n\n"
            "🎯 *Goal: 150+ minutes of moderate exercise per week.*\n"
            "⚠️ *Avoid over-exercising — it can worsen cortisol and hormone imbalance.*"
        )
    },
    {
        'keywords': ['manage', 'treatment', 'cure', 'control', 'help', 'improve'],
        'response': (
            "**Managing PCOS Effectively:**\n\n"
            "PCOS has no permanent cure, but symptoms can be well-managed:\n\n"
            "1. **Lifestyle Changes** — Often the most powerful treatment:\n"
            "   • Even 5–10% weight loss can restore hormonal balance\n"
            "   • Low-GI, anti-inflammatory diet\n"
            "   • Regular exercise\n\n"
            "2. **Medical Treatment** (consult your doctor):\n"
            "   • Birth control pills — regulate periods\n"
            "   • Metformin — improves insulin resistance\n"
            "   • Anti-androgens — reduce hair growth/acne\n\n"
            "3. **Supplements** (evidence-based):\n"
            "   • Myo-Inositol + D-Chiro Inositol\n"
            "   • Vitamin D\n"
            "   • Omega-3 fatty acids\n"
            "   • Magnesium\n\n"
            "4. **Mental Health:** Therapy, stress management, sleep hygiene\n\n"
            "⚕️ *Always work with a gynecologist or endocrinologist for a personalized plan.*"
        )
    },
    {
        'keywords': ['pregnancy', 'fertility', 'conceive', 'baby', 'pregnant'],
        'response': (
            "**PCOS and Fertility:**\n\n"
            "PCOS is a leading cause of infertility, but **most women with PCOS can get pregnant** with the right support.\n\n"
            "**Steps to improve fertility:**\n"
            "• Maintain a healthy weight (even 5% reduction helps)\n"
            "• Track ovulation with ovulation kits\n"
            "• Eat a low-GI diet to reduce insulin resistance\n"
            "• Work with a reproductive endocrinologist\n\n"
            "**Medical options:**\n"
            "• Letrozole or Clomiphene — ovulation induction\n"
            "• Metformin — improves ovulation in some women\n"
            "• IUI or IVF if needed\n\n"
            "💖 *Many women with PCOS have healthy pregnancies. Early treatment improves outcomes.*"
        )
    },
    {
        'keywords': ['insulin', 'blood sugar', 'diabetes', 'resistance'],
        'response': (
            "**PCOS and Insulin Resistance:**\n\n"
            "Up to **70% of women with PCOS** have insulin resistance, meaning cells don't respond properly to insulin.\n\n"
            "**Why it matters:**\n"
            "• High insulin → triggers ovaries to produce more testosterone\n"
            "• More testosterone → irregular periods, acne, hair growth\n"
            "• Increased risk of Type 2 diabetes over time\n\n"
            "**How to combat insulin resistance:**\n"
            "• Low-GI diet (avoid sugar spikes)\n"
            "• Exercise (especially strength training + walking after meals)\n"
            "• Inositol supplements\n"
            "• Metformin (prescription — consult your doctor)\n"
            "• Maintain healthy body weight"
        )
    },
    {
        'keywords': ['stress', 'anxiety', 'depression', 'mental health', 'mood'],
        'response': (
            "**PCOS and Mental Health:**\n\n"
            "Women with PCOS have significantly higher rates of:\n"
            "• Anxiety (up to 5x more likely)\n"
            "• Depression\n"
            "• Low self-esteem (related to physical symptoms)\n\n"
            "**Mind-Body Connection:**\n"
            "Stress → raises cortisol → worsens insulin resistance → worsens PCOS symptoms\n\n"
            "**Managing mental health with PCOS:**\n"
            "• Practice daily mindfulness or meditation (even 10 min helps)\n"
            "• Journaling about symptoms and feelings\n"
            "• Connect with PCOS support communities\n"
            "• Cognitive Behavioral Therapy (CBT) has strong evidence\n"
            "• Consider speaking with a mental health professional\n\n"
            "💜 *Your mental health matters as much as physical symptoms.*"
        )
    },
    {
        'keywords': ['hair', 'hirsutism', 'facial hair', 'hair loss', 'alopecia'],
        'response': (
            "**PCOS and Hair Changes:**\n\n"
            "**Excess Hair Growth (Hirsutism):** Caused by high androgens — affects face, chest, abdomen, back\n"
            "**Hair Thinning / Loss:** Androgenic alopecia — similar pattern to male-pattern baldness\n\n"
            "**Management Options:**\n"
            "✅ Medical: Anti-androgen medications (spironolactone), birth control pills\n"
            "✅ Cosmetic: Laser hair removal, electrolysis, waxing, threading\n"
            "✅ Diet: Reduce insulin to naturally lower androgens\n"
            "✅ Supplements: Spearmint tea (has natural anti-androgen effect), Saw Palmetto\n\n"
            "⚕️ *Always consult a dermatologist or gynecologist for hair-related concerns.*"
        )
    },
    {
        'keywords': ['acne', 'skin', 'oily', 'pimple', 'breakout'],
        'response': (
            "**PCOS-Related Skin Issues:**\n\n"
            "High androgen levels in PCOS cause excess sebum production → acne and oily skin.\n"
            "Common areas: jawline, chin, cheeks, neck, chest, upper back.\n\n"
            "**Management:**\n"
            "✅ Medical: Birth control pills, spironolactone, topical retinoids\n"
            "✅ Skincare: Gentle cleanser, niacinamide serum, oil-free moisturizer, SPF\n"
            "✅ Diet: Cut dairy and sugar (major acne triggers for PCOS)\n"
            "✅ Supplements: Zinc, spearmint tea, Omega-3\n\n"
            "⚕️ *See a dermatologist if acne is severe — don't pop or pick.*"
        )
    },
    {
        'keywords': ['weight', 'lose weight', 'obesity', 'fat', 'bmi'],
        'response': (
            "**PCOS and Weight Management:**\n\n"
            "Weight gain is common with PCOS due to insulin resistance. The good news:\n"
            "**Even 5% weight loss can restore ovulation and reduce symptoms significantly.**\n\n"
            "**Effective strategies:**\n"
            "• Low-carb or low-GI diet (not crash dieting)\n"
            "• Strength training + cardio combination\n"
            "• Intermittent fasting (16:8 can help insulin sensitivity)\n"
            "• Adequate sleep (poor sleep worsens insulin resistance)\n"
            "• Stress reduction\n\n"
            "⚠️ *Avoid very low-calorie diets — they can worsen hormonal imbalance.*\n"
            "⚕️ *Consult a nutritionist for a sustainable plan.*"
        )
    },
    {
        'keywords': ['period', 'menstrual', 'cycle', 'irregular', 'late period', 'missed'],
        'response': (
            "**PCOS and Menstrual Irregularity:**\n\n"
            "Irregular periods are the hallmark of PCOS — caused by anovulation (no egg release).\n\n"
            "**What's considered irregular:**\n"
            "• Less than 8 periods per year\n"
            "• Cycle shorter than 21 days or longer than 35 days\n"
            "• Extremely heavy or painful periods\n\n"
            "**Improving cycle regularity:**\n"
            "• Weight loss (even modest amounts)\n"
            "• Low-GI diet\n"
            "• Inositol supplements\n"
            "• Birth control pills (medically prescribed)\n"
            "• Stress reduction\n\n"
            "📅 *Track your cycle with our Cycle Tracker to identify patterns!*"
        )
    },
    {
        'keywords': ['doctor', 'test', 'diagnosis', 'ultrasound', 'blood test'],
        'response': (
            "**Getting Diagnosed with PCOS:**\n\n"
            "Diagnosis uses the **Rotterdam Criteria** — you need 2 of 3:\n"
            "1. Irregular or absent ovulation\n"
            "2. Elevated androgens (clinical or blood test)\n"
            "3. Polycystic ovaries on ultrasound\n\n"
            "**Tests your doctor may order:**\n"
            "🩸 Blood tests: LH, FSH, testosterone, DHEAS, insulin, fasting glucose, thyroid, prolactin\n"
            "🔊 Pelvic ultrasound: Check ovary size and follicle count\n\n"
            "**Specialists to see:**\n"
            "• Gynecologist — first point of contact\n"
            "• Endocrinologist — for hormonal/metabolic issues\n"
            "• Reproductive endocrinologist — for fertility concerns\n"
            "• Dermatologist — for skin and hair issues\n\n"
            "⚕️ *Our AI tool gives risk estimates only — not a medical diagnosis.*"
        )
    },
    {
        'keywords': ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'greet'],
        'response': (
            "👋 **Hello! I'm PCOSense AI Assistant.**\n\n"
            "I can answer your questions about PCOS, including:\n"
            "• What PCOS is and its symptoms\n"
            "• Diet and exercise recommendations\n"
            "• Managing weight, acne, hair issues\n"
            "• Fertility and pregnancy with PCOS\n"
            "• When to see a doctor\n\n"
            "Just type your question and I'll do my best to help! 💜"
        )
    },
]

FALLBACK = (
    "I'm sorry, I didn't quite understand that question. I can help you with:\n\n"
    "• **PCOS basics** — 'What is PCOS?'\n"
    "• **Symptoms** — 'What are PCOS symptoms?'\n"
    "• **Diet** — 'What should I eat with PCOS?'\n"
    "• **Exercise** — 'What exercises are good for PCOS?'\n"
    "• **Treatment** — 'How do I manage PCOS?'\n"
    "• **Fertility** — 'Can I get pregnant with PCOS?'\n\n"
    "Try asking one of the above topics! 💜"
)


def find_response(message: str) -> str:
    msg = message.lower().strip()
    for entry in KB:
        for keyword in entry['keywords']:
            if keyword in msg:
                return entry['response']
    return FALLBACK


@chatbot_bp.route('/message', methods=['POST'])
@jwt_required()
def chat():
    data = request.get_json()
    message = data.get('message', '').strip()
    if not message:
        return jsonify({'error': 'Message is required'}), 400

    response = find_response(message)
    return jsonify({'response': response}), 200
