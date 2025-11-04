-- Analytics aggregation function
CREATE OR REPLACE FUNCTION get_usage_analytics(
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  user_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  total_cost DECIMAL,
  total_requests BIGINT,
  total_input_tokens BIGINT,
  total_output_tokens BIGINT,
  total_tokens BIGINT,
  user_id UUID,
  user_email TEXT,
  model_id UUID,
  model_name TEXT,
  provider TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(lr.cost) AS total_cost,
    COUNT(*) AS total_requests,
    SUM(lr.input_tokens) AS total_input_tokens,
    SUM(lr.output_tokens) AS total_output_tokens,
    SUM(lr.input_tokens + lr.output_tokens) AS total_tokens,
    lr.user_id,
    u.email AS user_email,
    lr.model_id,
    lm.display_name AS model_name,
    lm.provider
  FROM llm_requests lr
  LEFT JOIN users u ON lr.user_id = u.id
  LEFT JOIN llm_models lm ON lr.model_id = lm.id
  WHERE
    lr.created_at >= period_start
    AND lr.created_at <= period_end
    AND lr.status = 'success'
    AND (user_filter IS NULL OR lr.user_id = user_filter)
  GROUP BY lr.user_id, u.email, lr.model_id, lm.display_name, lm.provider
  ORDER BY total_cost DESC;
END;
$$;

