-- Migration: adds yearly-billing support to an existing rakaez-erp database.
-- Run this ONCE in the Supabase SQL Editor (same place schema.sql was run).
-- Safe to re-run: IF NOT EXISTS guards against double-applying it.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'monthly';
