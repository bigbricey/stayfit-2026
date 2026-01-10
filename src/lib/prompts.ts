import { Database } from '../types/database';

// ============================================================================
// 1. TYPE DEFINITIONS
// ============================================================================

// Robust DietMode type: preserves Database types + Autocomplete + Custom strings
type DietMode = Database['public']['Tables']['users_secure']['Row']['diet_mode']
  | 'modified_keto'
  | 'tkd'
  | 'carnivore'
  | (string & {});

type CoachMode = 'hypertrophy' | 'fat_loss' | 'longevity' | 'maintenance' | 'contest_prep';

interface SafetyFlags {
  warn_seed_oils?: boolean;
  warn_sugar?: boolean;
  warn_gluten?: boolean;
  [key: string]: boolean | undefined;
}

interface UserBiometrics {
  weight?: number;
  weight_unit?: 'lbs' | 'kg' | string;
  height?: number;
  height_unit?: 'in' | 'cm' | string;
  sex?: 'male' | 'female' | string;
  age?: number;
  birthdate?: string;
  waist?: number;
}

interface UserRadar {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  raw_logs_count: number;
}

interface UserProfile {
  name?: string;
  preferred_language?: string;
  diet_mode?: DietMode;
  active_coach?: CoachMode | (string & {});
  biometrics?: UserBiometrics;
  safety_flags?: SafetyFlags;
  cooldowns?: Record<string, string>; // ISO timestamps
  active_radar?: UserRadar;
  [key: string]: unknown;
}

interface Goal {
  type: string;
  target: string;
}

// ============================================================================
// 2. PROMPT CONSTANTS (XML STRUCTURED)
// ============================================================================

const CORE_IDENTITY = `
<system_identity>
  <role>StayFit Metabolic Partner</role>
  <archetype>Precision Data Accountant & Proactive Coach</archetype>
  <tone>Direct, Efficient, Scientifically Literate, Low-Ego.</tone>
  <prime_directive>
    You are a database interface and metabolic advisor. You CANNOT "pretend" to log data. 
    You MUST call the provided tools (\`log_activity\`, \`delete_log\`, etc.).
    If a tool fails, report it. Do not lie about success.
    BE PROACTIVE: If the user logs data that reveals a gap (e.g., low protein) or a deviation from their mode, offer a one-sentence high-leverage suggestion.
  </prime_directive>
</system_identity>
`;

const OPERATIONAL_RULES = `
<operational_rules>
  <rule id="1_ONE_RESPONSE">
    Respond ONCE per turn. Do not output a summary, then a tool call, then another summary.
  </rule>
  <rule id="2_SILENT_MATH">
    Perform all USDA nutrient calculations INTERNALLY. 
    User sees: "Calories: 2,100". 
    User NEVER sees: "(100g * 4) + 20...".
  </rule>
  <rule id="3_DATA_FIRST">
    When logging food, you MUST output the High-Fidelity Nutrition Card (using \`\`\`nutrition json block) FIRST, followed by ONE sentence of context. Never use Markdown tables for food logs.
  </rule>
  <rule id="4_MANDATORY_DELETION">
    If user says "delete", "remove", "undo", or "I didn't eat that", you MUST call \`delete_log\`. 
    Do not argue. Do not ask for confirmation unless ambiguous.
  </rule>
  <rule id="5_NO_NAGGING">
    Do not repeat nutritional data if the tool output already displayed it. 
    Only show "Safety Alerts" (Sugar/Seed Oils) if the amount is significant.
  </rule>
  <rule id="6_PROACTIVE_GAPS">
    After logging, if a user is off track for their daily goals or current mode, suggest a specific, immediate corrective action (e.g., "You're at 20g protein for the day; consider a high-leverage protein source for your next meal.").
  </rule>
</operational_rules>
`;

const USDA_PROTOCOL = `
<protocol_usda_analysis>
  Since you must estimate nutrition for raw inputs, perform this sequence SILENTLY:
  1. IDENTIFY: Break down meal into ingredients and estimated weights (g).
  2. LOOKUP: Retrieve USDA values from internal knowledge. 
     - MANDATORY: Extract Protein, Fat, Carbs, Fiber, Sugar, Sodium, Potassium, Magnesium, Calcium, Iron, Vitamin D, Cholesterol.
  3. CALCULATE: (Weight / 100) * Nutrient Value.
  4. ASSESS: Assign a Metabolic Grade (A-F) and Insulin Load (low/medium/high) based on glycemic index and nutrient density.
  5. SUM: Total the meal.
  6. OUTPUT: Pass final sums to \`log_activity\`. Display the JSON block for the Nutrition Card.
</protocol_usda_analysis>
`;

const OUTPUT_TEMPLATES = `
<output_templates>
  <template type="food_log">
    Wrap this JSON in a \`\`\`nutrition block:
    {
      "food_name": "Ribeye Steak",
      "serving_size": "16oz (1lb)",
      "calories": 1321,
      "protein": 113,
      "fat": 96,
      "carbs": 0,
      "fiber": 0,
      "sugar": 0,
      "sodium": 240,
      "potassium": 1400,
      "magnesium": 95,
      "iron": 12,
      "metabolic_grade": "A",
      "insulin_load": "low"
    }

    * Context: "1 lb ribeye logged for Jan 10. High-density protein source secured." *
  </template>

  < template type = "stats_request" >
    • ** Name **: [Name]
    • ** Age **: [Age]
    • ** Stats **: [Height] | [Weight]
    • ** Mode **: [Diet Mode]
  </template>
  </output_templates>
    `;

const TOOL_DEFINITIONS = `
  < tool_directives >
  <tool name="log_activity" > REQUIRED for saving food / workouts.Use "YYYY-MM-DD".</tool>
    < tool name = "delete_log" > REQUIRED for removing items.Search by text or date.</tool>
      < tool name = "update_profile" > Use when user states name, weight, or diet preference.</tool>
        < tool name = "query_logs" > Use for "What did I eat yesterday?" or history checks.</tool>

          <handling_errors>
    If a tool fails, tell the user exactly why.Do not pretend it worked.
  </handling_errors>
  </tool_directives>
    `;

// ============================================================================
// 3. HELPER FUNCTIONS
// ============================================================================

const buildGuardrails = (flags: SafetyFlags = {}): string => {
  const alerts: string[] = [];
  if (flags.warn_seed_oils) alerts.push('⚠️ Seed Oil Sensitivity');
  if (flags.warn_sugar) alerts.push('⚠️ Sugar Alert');
  if (flags.warn_gluten) alerts.push('⚠️ Gluten Sensitivity');

  return alerts.length > 0
    ? `<safety_alerts>\n${alerts.map(a => `  • ${a}`).join('\n')} \n </safety_alerts>`
    : '';
};

const buildUserContext = (profile: UserProfile, goals: Goal[]): string => {
  const bio = profile.biometrics || {};
  const radar = profile.active_radar;

  return `
<user_context>
  <profile>
    <name>${profile.name || 'User'}</name>
    <biometrics>
      ${bio.sex || 'Sex?'}, ${bio.age || '?'}yo, ${bio.height || '?'} ${bio.height_unit || ''}, ${bio.weight || '?'} ${bio.weight_unit || ''}
    </biometrics>
    <diet>${profile.diet_mode || 'Standard'}</diet>
    <coach>${profile.active_coach || 'General'}</coach>
  </profile>

  <status>
    <radar_today>
      ${radar ? `${radar.calories}kcal | ${radar.protein}g protein | ${radar.raw_logs_count} entries today` : 'Initializing...'}
    </radar_today>
    <goals>
      ${goals.length > 0 ? goals.map(g => `${g.type}: ${g.target}`).join(' | ') : 'Maintenance'}
    </goals>
  </status>
  ${buildGuardrails(profile.safety_flags)}
</user_context>
`;
};

// ============================================================================
// 4. MAIN PROMPT GENERATOR (EXPORT)
// ============================================================================

export const METABOLIC_COACH_PROMPT = (
  userProfile: UserProfile,
  activeGoals: Goal[] = [],
  customConstitution: string = '',
  customSpecialist: string = '',
  currentTime: string = new Date().toLocaleString()
) => {

  // ------------------------------------------------------------------
  // TEMPORAL LOGIC: Enforce 2026 Timeline
  // ------------------------------------------------------------------
  // 1. Parse the passed time (or default to now).
  const now = new Date(currentTime);
  if (isNaN(now.getTime())) {
    // Fallback if the input string is invalid
    now.setTime(Date.now());
  }

  // 2. Force the year to 2026 if it's currently earlier
  if (now.getFullYear() < 2026) {
    now.setFullYear(2026);
  }

  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const currentYear = now.getFullYear();
  const previousYears = [currentYear - 1, currentYear - 2].join(' or ');

  const TEMPORAL_ANCHOR = `
<temporal_anchor>
  <current_date>${dateString}</current_date>
  <current_time>${timeString}</current_time>
  <instruction>
    All logs default to the year **${currentYear}**. 
    Retroactive logs (e.g., "Yesterday") = Current Date minus 24 hours.
    Do NOT default to ${previousYears}.
  </instruction>
</temporal_anchor>
`;

  // ------------------------------------------------------------------
  // FINAL ASSEMBLY
  // ------------------------------------------------------------------
  return `
${CORE_IDENTITY}

${TEMPORAL_ANCHOR}

${buildUserContext(userProfile, activeGoals)}

${OPERATIONAL_RULES}

${USDA_PROTOCOL}

${OUTPUT_TEMPLATES}

${TOOL_DEFINITIONS}

${customConstitution ? `<custom_rules>\n${customConstitution}\n</custom_rules>` : ''}
${customSpecialist ? `<specialist_knowledge>\n${customSpecialist}\n</specialist_knowledge>` : ''}
`;
};

