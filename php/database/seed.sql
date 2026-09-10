-- SUBZWARI GLOBAL NETWORK — demo/reference data.
-- Safe to import after schema.sql. Uses INSERT IGNORE so re-running it
-- won't error on duplicates. This does NOT create a Super Admin account —
-- use create-admin.php for that (it needs to hash the password with PHP).

-- Countries
INSERT IGNORE INTO countries (name, slug, iso_code, summary, display_order) VALUES
('Pakistan', 'pakistan', 'PK', 'The Subzwari community in Pakistan.', 0),
('United Arab Emirates', 'united-arab-emirates', 'AE', 'The Subzwari community in the United Arab Emirates.', 1),
('United Kingdom', 'united-kingdom', 'GB', 'The Subzwari community in the United Kingdom.', 2),
('United States', 'united-states', 'US', 'The Subzwari community in the United States.', 3),
('Canada', 'canada', 'CA', 'The Subzwari community in Canada.', 4),
('India', 'india', 'IN', 'The Subzwari community in India.', 5),
('Saudi Arabia', 'saudi-arabia', 'SA', 'The Subzwari community in Saudi Arabia.', 6),
('Australia', 'australia', 'AU', 'The Subzwari community in Australia.', 7);

-- Cities (looked up by country slug so this works regardless of auto-increment ids)
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Karachi', 'karachi', id FROM countries WHERE slug = 'pakistan';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Lahore', 'lahore', id FROM countries WHERE slug = 'pakistan';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Islamabad', 'islamabad', id FROM countries WHERE slug = 'pakistan';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Dubai', 'dubai', id FROM countries WHERE slug = 'united-arab-emirates';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Abu Dhabi', 'abu-dhabi', id FROM countries WHERE slug = 'united-arab-emirates';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'London', 'london', id FROM countries WHERE slug = 'united-kingdom';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Manchester', 'manchester', id FROM countries WHERE slug = 'united-kingdom';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'New York', 'new-york', id FROM countries WHERE slug = 'united-states';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Houston', 'houston', id FROM countries WHERE slug = 'united-states';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Toronto', 'toronto', id FROM countries WHERE slug = 'canada';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Vancouver', 'vancouver', id FROM countries WHERE slug = 'canada';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Mumbai', 'mumbai', id FROM countries WHERE slug = 'india';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Delhi', 'delhi', id FROM countries WHERE slug = 'india';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Riyadh', 'riyadh', id FROM countries WHERE slug = 'saudi-arabia';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Jeddah', 'jeddah', id FROM countries WHERE slug = 'saudi-arabia';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Sydney', 'sydney', id FROM countries WHERE slug = 'australia';
INSERT IGNORE INTO cities (name, slug, country_id)
SELECT 'Melbourne', 'melbourne', id FROM countries WHERE slug = 'australia';

-- Professional categories
INSERT IGNORE INTO professional_categories (name, slug, display_order) VALUES
('Business', 'business', 0), ('Technology', 'technology', 1), ('Finance', 'finance', 2),
('Healthcare', 'healthcare', 3), ('Law', 'law', 4), ('Education', 'education', 5),
('Engineering', 'engineering', 6), ('Marketing', 'marketing', 7), ('Real Estate', 'real-estate', 8),
('Manufacturing', 'manufacturing', 9), ('Other', 'other', 10);

-- Business categories
INSERT IGNORE INTO business_categories (name, slug, display_order) VALUES
('Business', 'business', 0), ('Technology', 'technology', 1), ('Healthcare', 'healthcare', 2),
('Finance', 'finance', 3), ('Law', 'law', 4), ('Education', 'education', 5),
('Engineering', 'engineering', 6), ('Marketing', 'marketing', 7), ('Design', 'design', 8),
('Real Estate', 'real-estate', 9), ('Logistics', 'logistics', 10), ('Manufacturing', 'manufacturing', 11),
('Media', 'media', 12), ('Government', 'government', 13), ('Other', 'other', 14);

-- Story categories
INSERT IGNORE INTO story_categories (name, slug) VALUES
('Member Stories', 'member-stories'), ('Family Stories', 'family-stories'), ('Heritage', 'heritage'),
('History', 'history'), ('Achievements', 'achievements'), ('Professional Journeys', 'professional-journeys'),
('Community Stories', 'community-stories'), ('Global Subzwari Stories', 'global-subzwari-stories');

-- CMS pages (published defaults — edit these from /admin/cms-pages.php)
INSERT IGNORE INTO pages (title, slug, body, status) VALUES
('About SUBZWARI Global Network', 'about', 'SUBZWARI Global Network is a global digital community and family network for people who identify as Subzwari — connecting members worldwide, preserving family heritage, enabling professional networking, and supporting community events and stories.\n\nOne Name. One Community. One Network.', 'published'),
('Community Guidelines', 'community-guidelines', 'Our community is built on trust, respect, and shared heritage. Members are expected to provide accurate information, treat one another with respect, and use the platform in the spirit of SUBZWARI''s ARE ONE.', 'published'),
('How Verification Works', 'verification', 'Verification helps keep SUBZWARI Global Network a trusted community. Complete your profile, submit your verification request, and our community team will review it — no government documents required by default.', 'published');

-- Sample family branch
INSERT IGNORE INTO family_branches (name, slug, description, region) VALUES
('Subzwari Main Lineage', 'subzwari-main-lineage', 'The primary Subzwari family lineage, open to all members tracing their roots.', 'South Asia');
