-- Functions to update asset balances atomically

-- Function to increment asset balance
CREATE OR REPLACE FUNCTION increment_asset_balance(asset_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE assets 
  SET current_balance = current_balance + amount
  WHERE id = asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement asset balance
CREATE OR REPLACE FUNCTION decrement_asset_balance(asset_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE assets 
  SET current_balance = current_balance - amount
  WHERE id = asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;