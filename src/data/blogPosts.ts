export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    author: string;
    authorBio: string;
    date: string;
    readTime: string;
    keywords: string[];
    image?: string;
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'how-many-calories-should-i-eat-to-lose-weight',
        title: 'How Many Calories Should I Eat to Lose Weight? A Complete Guide',
        excerpt: 'Learn the exact calorie deficit you need to lose weight safely and effectively. Our science-backed guide explains TDEE, BMR, and how to calculate your ideal calorie intake.',
        category: 'Weight Loss',
        author: 'Dr. Sarah Johnson',
        authorBio: 'Registered Dietitian with 15+ years of experience in clinical nutrition and weight management.',
        date: '2024-12-15',
        readTime: '8 min read',
        keywords: ['calories to lose weight', 'calorie deficit', 'TDEE calculator', 'weight loss calories', 'how many calories'],
        content: `
# How Many Calories Should I Eat to Lose Weight?

The most common question in weight loss is simple: **how many calories do I need to eat to lose weight?** The answer depends on your body, activity level, and goals.

## Understanding Calorie Deficit

To lose weight, you need to burn more calories than you consume. This is called a **calorie deficit**. A deficit of 500 calories per day typically results in losing about 1 pound per week.

### The Formula
\`\`\`
Weight Loss Calories = TDEE - Deficit (500-750)
\`\`\`

## Step 1: Calculate Your TDEE

Your **Total Daily Energy Expenditure (TDEE)** is how many calories you burn each day including:

- **Basal Metabolic Rate (BMR)**: Calories burned at rest
- **Activity Level**: Calories burned through movement
- **Thermic Effect of Food**: Calories burned digesting food

### Average TDEE by Activity Level

| Activity Level | Women | Men |
|---------------|-------|-----|
| Sedentary | 1,600-1,800 | 2,000-2,200 |
| Lightly Active | 1,800-2,000 | 2,200-2,400 |
| Moderately Active | 2,000-2,200 | 2,400-2,800 |
| Very Active | 2,200-2,400 | 2,800-3,200 |

## Step 2: Set Your Deficit

For safe, sustainable weight loss:

- **500 calorie deficit** = ~1 lb/week
- **750 calorie deficit** = ~1.5 lbs/week
- **1000 calorie deficit** = ~2 lbs/week (maximum recommended)

> ⚠️ **Warning**: Never go below 1,200 calories (women) or 1,500 calories (men) without medical supervision.

## Step 3: Track Your Intake

Use a calorie tracking app like StayFitWithAI to log your meals and monitor your progress. Consistency is key!

### Tips for Accurate Tracking

1. **Weigh your food** - estimates are often wrong by 20-50%
2. **Log everything** - including drinks, sauces, and snacks
3. **Pre-log meals** - plan ahead for better control
4. **Review weekly** - daily fluctuations are normal

## Sample Calorie Targets

Here are example targets for weight loss:

**For a 150 lb woman (moderately active):**
- TDEE: ~2,000 calories
- Weight Loss Target: 1,500 calories/day
- Expected Loss: ~1 lb/week

**For a 180 lb man (moderately active):**
- TDEE: ~2,600 calories
- Weight Loss Target: 2,100 calories/day
- Expected Loss: ~1 lb/week

## The Bottom Line

To lose weight:
1. Calculate your TDEE
2. Subtract 500-750 calories
3. Track your intake consistently
4. Adjust based on results

**Ready to start?** Try our free [Calorie Calculator](/tools/calorie-calculator) to find your personalized target.
    `,
    },
    {
        slug: 'best-foods-for-weight-loss',
        title: 'The 20 Best Foods for Weight Loss (Backed by Science)',
        excerpt: 'Discover the most effective foods for losing weight, from high-protein options to fiber-rich vegetables. All recommendations are backed by scientific research.',
        category: 'Nutrition',
        author: 'Emily Chen, RD',
        authorBio: 'Sports nutritionist specializing in performance nutrition and body composition.',
        date: '2024-12-14',
        readTime: '10 min read',
        keywords: ['best foods for weight loss', 'weight loss foods', 'foods that help lose weight', 'healthy foods', 'fat burning foods'],
        content: `
# The 20 Best Foods for Weight Loss

Not all calories are created equal. Some foods are better for weight loss because they keep you full longer, boost metabolism, or are hard to overeat.

## High-Protein Foods

Protein is the king of nutrients for weight loss. It boosts metabolism, reduces appetite, and helps preserve muscle.

### 1. Eggs
Eggs are incredibly nutrient-dense and filling. Studies show eating eggs for breakfast can help you eat fewer calories throughout the day.

- **Calories**: 70 per large egg
- **Protein**: 6g
- **Why it works**: High satiety, nutrient-dense

### 2. Chicken Breast
Lean protein that's versatile and filling.

- **Calories**: 165 per 3.5 oz
- **Protein**: 31g
- **Why it works**: Very high protein, low fat

### 3. Greek Yogurt
Packed with protein and probiotics.

- **Calories**: 100 per 6 oz (plain, nonfat)
- **Protein**: 17g
- **Why it works**: Protein + probiotics for gut health

## High-Fiber Vegetables

Fiber fills you up without adding many calories.

### 4. Broccoli
Low in calories, high in fiber and nutrients.

- **Calories**: 55 per cup
- **Fiber**: 5g
- **Why it works**: Volume eating, very filling

### 5. Spinach
Extremely low calorie, nutrient powerhouse.

- **Calories**: 7 per cup (raw)
- **Fiber**: 1g
- **Why it works**: Add volume to any meal

### 6. Cauliflower
Versatile low-carb substitute.

- **Calories**: 25 per cup
- **Fiber**: 2g
- **Why it works**: Rice/mash substitute, very filling

## Healthy Fats

### 7. Avocado
Healthy fats that increase satiety.

- **Calories**: 160 per half
- **Fiber**: 7g
- **Why it works**: Healthy fats keep you satisfied

### 8. Almonds
Protein, fiber, and healthy fats combo.

- **Calories**: 164 per oz (23 almonds)
- **Protein**: 6g
- **Why it works**: Satisfying snack, controls hunger

## Complex Carbohydrates

### 9. Oatmeal
Slow-digesting carbs that keep you full.

- **Calories**: 150 per cup (cooked)
- **Fiber**: 4g
- **Why it works**: Sustained energy release

### 10. Sweet Potatoes
Nutrient-dense carb source.

- **Calories**: 103 per medium
- **Fiber**: 4g
- **Why it works**: Filling, naturally sweet

## The Bottom Line

Focus on whole, unprocessed foods that are:
- High in protein
- Rich in fiber
- Low in calorie density

**Track your nutrition** with StayFitWithAI to see exactly what you're eating and optimize for weight loss.
    `,
    },
    {
        slug: 'intermittent-fasting-beginners-guide',
        title: 'Intermittent Fasting for Beginners: Complete 2024 Guide',
        excerpt: 'Everything you need to know about intermittent fasting - from 16:8 to OMAD. Learn the benefits, how to start, and what to eat.',
        category: 'Weight Loss',
        author: 'Dr. Michael Torres',
        authorBio: 'Medical doctor specializing in metabolic health and longevity.',
        date: '2024-12-13',
        readTime: '12 min read',
        keywords: ['intermittent fasting', 'IF for beginners', '16:8 fasting', 'fasting for weight loss', 'how to fast'],
        content: `
# Intermittent Fasting for Beginners

Intermittent fasting (IF) isn't a diet—it's an eating pattern. Instead of focusing on *what* you eat, IF focuses on *when* you eat.

## What is Intermittent Fasting?

IF cycles between periods of eating and fasting. During fasting periods, you eat nothing or very little.

## Popular IF Methods

### 16:8 Method (Most Popular)
- **Fast**: 16 hours
- **Eat**: 8-hour window
- **Example**: Eat between 12pm-8pm

### 5:2 Diet
- **Normal eating**: 5 days per week
- **Restricted (500-600 cal)**: 2 days per week

### OMAD (One Meal a Day)
- **Fast**: 23 hours
- **Eat**: 1 large meal

## Benefits of Intermittent Fasting

Research shows IF can:

1. **Promote weight loss** - Naturally reduces calorie intake
2. **Improve insulin sensitivity** - Better blood sugar control
3. **Boost autophagy** - Cellular cleanup and repair
4. **Simplify your day** - Fewer meals to plan

## How to Start 16:8 Fasting

### Week 1: 12:12
Start with a 12-hour fast (7pm to 7am) to ease into it.

### Week 2: 14:10
Push your first meal to 9am, last meal at 7pm.

### Week 3: 16:8
Skip breakfast entirely. First meal at noon.

## What to Eat During Your Window

Focus on:
- **Protein** at every meal
- **Vegetables** for fiber and nutrients
- **Healthy fats** for satiety
- **Complex carbs** for energy

## Common Mistakes to Avoid

1. **Overeating during your window** - IF isn't a free pass to binge
2. **Not drinking enough water** - Stay hydrated during fasts
3. **Starting too aggressive** - Ease into longer fasts
4. **Ignoring hunger signals** - Some hunger is normal, extreme hunger isn't

## Is IF Right for You?

IF is generally safe for healthy adults. **Avoid IF if you**:
- Are pregnant or breastfeeding
- Have a history of eating disorders
- Have diabetes (consult doctor first)
- Are underweight

## Track Your Progress

Use StayFitWithAI to:
- Log your eating windows
- Track calories during feeding periods
- Monitor weight loss progress

**Ready to try it?** Start with 12:12 this week and see how you feel!
    `,
    },
    {
        slug: 'how-to-calculate-macros-for-weight-loss',
        title: 'How to Calculate Macros for Weight Loss (Step-by-Step)',
        excerpt: 'Learn how to calculate your ideal protein, carbs, and fat ratios for maximum fat loss while preserving muscle.',
        category: 'Nutrition',
        author: 'Emily Chen, RD',
        authorBio: 'Sports nutritionist specializing in performance nutrition and body composition.',
        date: '2024-12-12',
        readTime: '9 min read',
        keywords: ['calculate macros', 'macros for weight loss', 'macro calculator', 'protein carbs fat', 'macro tracking'],
        content: `
# How to Calculate Macros for Weight Loss

Counting macros (macronutrients) gives you more control than just counting calories. Here's how to calculate your ideal breakdown.

## What Are Macros?

The three macronutrients are:
- **Protein**: 4 calories per gram
- **Carbohydrates**: 4 calories per gram  
- **Fat**: 9 calories per gram

## Step 1: Set Your Calories

First, determine your calorie target for weight loss (TDEE minus 500-750).

**Example**: 2,000 calorie target

## Step 2: Calculate Protein

Protein is the most important macro for weight loss. It preserves muscle and keeps you full.

**Recommended**: 0.7-1g per pound of body weight

**Example** (150 lb person):
- 150 × 0.8 = 120g protein
- 120 × 4 = 480 calories from protein

## Step 3: Calculate Fat

Fat is essential for hormones and nutrient absorption.

**Recommended**: 0.3-0.4g per pound of body weight

**Example** (150 lb person):
- 150 × 0.35 = 52g fat
- 52 × 9 = 468 calories from fat

## Step 4: Calculate Carbs

Fill remaining calories with carbs.

**Example**:
- Total: 2,000 calories
- Protein: 480 calories
- Fat: 468 calories
- Carbs: 2,000 - 480 - 468 = 1,052 calories
- 1,052 ÷ 4 = 263g carbs

## Final Macro Split

For our 150 lb example at 2,000 calories:
- **Protein**: 120g (24%)
- **Fat**: 52g (23%)
- **Carbs**: 263g (53%)

## Common Macro Splits

| Goal | Protein | Fat | Carbs |
|------|---------|-----|-------|
| Weight Loss | 30% | 25% | 45% |
| Low Carb | 30% | 45% | 25% |
| Keto | 25% | 70% | 5% |
| Muscle Gain | 30% | 25% | 45% |

## Tips for Hitting Your Macros

1. **Plan meals in advance** - Pre-log to hit targets
2. **Prioritize protein** - It's hardest to hit
3. **Prep protein sources** - Cook chicken, eggs, etc.
4. **Use a food scale** - Accuracy matters
5. **Review and adjust** - Check weekly averages

## Track Macros with StayFitWithAI

Our free food diary tracks all three macros automatically. Log your meals and see exactly how you're doing.

**Start tracking today** → [Food Diary](/food)
    `,
    },
    {
        slug: 'why-am-i-not-losing-weight',
        title: "Why Am I Not Losing Weight? 12 Reasons You're Stuck",
        excerpt: "Frustrated with the scale? Here are the 12 most common reasons you're not losing weight—and exactly how to fix each one.",
        category: 'Weight Loss',
        author: 'Dr. Sarah Johnson',
        authorBio: 'Registered Dietitian with 15+ years of experience in clinical nutrition and weight management.',
        date: '2024-12-11',
        readTime: '11 min read',
        keywords: ['not losing weight', 'weight loss plateau', 'stuck weight', 'why cant I lose weight', 'weight loss tips'],
        content: `
# Why Am I Not Losing Weight?

You're doing everything right—or so you think—but the scale won't budge. Here are the real reasons you're stuck.

## 1. You're Eating More Than You Think

**The Problem**: Studies show people underestimate calories by 20-50%.

**The Fix**: 
- Use a food scale for 2 weeks
- Log EVERYTHING including bites and sips
- Measure cooking oils carefully (1 tbsp = 120 cal)

## 2. You're Not Eating Enough Protein

**The Problem**: Low protein = muscle loss + increased hunger.

**The Fix**:
- Aim for 0.7-1g per pound body weight
- Include protein at every meal
- Start day with high-protein breakfast

## 3. You're Drinking Your Calories

**The Problem**: Liquid calories don't trigger fullness.

**Common culprits**:
- Coffee drinks: 200-500 cal
- Smoothies: 300-600 cal
- Alcohol: 150-300 cal per drink

**The Fix**: Stick to water, black coffee, unsweetened tea.

## 4. You're Not Sleeping Enough

**The Problem**: Poor sleep increases hunger hormones (ghrelin) and decreases satiety hormones (leptin).

**The Fix**:
- Get 7-9 hours per night
- Keep consistent sleep schedule
- Limit screens before bed

## 5. You're Too Stressed

**The Problem**: Cortisol promotes fat storage, especially belly fat.

**The Fix**:
- Daily stress management (walk, meditate)
- Reduce caffeine
- Prioritize sleep & recovery

## 6. You're Overestimating Exercise Calories

**The Problem**: Fitness trackers overestimate by 20-93%.

**The Fix**:
- Don't eat back exercise calories
- Or eat back only 50% max
- Focus on NEAT (daily movement)

## 7. You Have a Medical Issue

**Possible conditions**:
- Hypothyroidism
- PCOS
- Insulin resistance
- Medications (antidepressants, steroids)

**The Fix**: See a doctor for bloodwork if you've been stuck 6+ weeks.

## 8. You're Being Impatient

**The Reality**: 
- 1-2 lbs/week is healthy loss
- Scale fluctuates 2-5 lbs daily
- Water retention masks fat loss

**The Fix**: Track weekly averages, not daily weights.

## 9. You're Not Moving Enough

**The Problem**: Gym workouts don't offset sitting all day.

**The Fix**:
- Get 10,000+ steps daily
- Take movement breaks every hour
- Stand more, sit less

## 10. You're Eating Too Little

**The Problem**: Severe restriction slows metabolism and increases binge risk.

**The Fix**:
- Don't go below 1,200 (women) or 1,500 (men)
- Take diet breaks every 8-12 weeks
- Focus on moderate deficit (500 cal)

## 11. You're Inconsistent

**The Problem**: Great weekdays, terrible weekends.

**The Fix**:
- Same calorie target 7 days a week
- Plan for social events
- 80/20 rule: consistent most of the time

## 12. You've Been Dieting Too Long

**The Problem**: Metabolic adaptation after months of deficit.

**The Fix**:
- Take a 2-week maintenance break
- Increase calories to TDEE
- Resume deficit after break

## The Bottom Line

Weight loss stalls happen. Usually it's one of these 12 reasons—most commonly #1 (eating more than you think).

**Track accurately for 2 weeks** with StayFitWithAI and see what's really happening.
    `,
    },
];
