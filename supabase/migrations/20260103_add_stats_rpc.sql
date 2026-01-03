-- Migration: Add get_metabolic_stats RPC for high-performance aggregation
-- Performance: Moves compute to DB, prevents OOM on large datasets

CREATE OR REPLACE FUNCTION get_metabolic_stats(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_calories', COALESCE(SUM((data_structured->>'calories')::numeric), 0),
    'avg_calories', COALESCE(AVG((data_structured->>'calories')::numeric), 0),
    'total_protein', COALESCE(SUM((data_structured->>'protein')::numeric), 0),
    'total_carbs', COALESCE(SUM((data_structured->>'carbs')::numeric), 0),
    'total_fat', COALESCE(SUM((data_structured->>'fat')::numeric), 0),
    'log_count', COUNT(*)
  )
  INTO v_result
  FROM metabolic_logs
  WHERE user_id = p_user_id
    AND log_type = 'meal'
    AND logged_at >= p_start_date
    AND logged_at <= p_end_date;

  RETURN v_result;
END;
$$;
