-- SUBZWARI GLOBAL NETWORK — MySQL schema
-- Import this in phpMyAdmin (or `mysql -u user -p dbname < schema.sql`)
-- into an EMPTY database. Uses InnoDB + utf8mb4 throughout.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────────────────────────────────
-- IDENTITY
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin','admin','verification_manager','content_manager','regional_coordinator','moderator','member') NOT NULL DEFAULT 'member',
  account_status ENUM('active','suspended','deactivated') NOT NULL DEFAULT 'active',
  email_verified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (role),
  INDEX (account_status)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- GEOGRAPHY
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE countries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  iso_code VARCHAR(3) NULL,
  summary TEXT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE cities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  country_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_city_country_slug (country_id, slug),
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- PROFILES & FAMILY
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  photo_path VARCHAR(255) NULL,
  gender ENUM('male','female','other','prefer_not_to_say') NULL,
  date_of_birth DATE NULL,
  country_id INT UNSIGNED NULL,
  city_id INT UNSIGNED NULL,
  current_residence VARCHAR(200) NULL,
  nationality VARCHAR(100) NULL,
  bio TEXT NULL,
  fathers_name VARCHAR(150) NULL,
  grandfathers_name VARCHAR(150) NULL,
  great_grandfathers_name VARCHAR(150) NULL,
  ancestral_region VARCHAR(150) NULL,
  family_information TEXT NULL,
  profession VARCHAR(150) NULL,
  job_title VARCHAR(150) NULL,
  company VARCHAR(150) NULL,
  industry VARCHAR(150) NULL,
  skills VARCHAR(500) NULL COMMENT 'comma-separated for simplicity',
  education VARCHAR(200) NULL,
  university VARCHAR(200) NULL,
  linkedin_url VARCHAR(255) NULL,
  website_url VARCHAR(255) NULL,
  open_to_networking TINYINT(1) NOT NULL DEFAULT 0,
  open_to_mentorship TINYINT(1) NOT NULL DEFAULT 0,
  open_to_business_network TINYINT(1) NOT NULL DEFAULT 0,
  open_to_events TINYINT(1) NOT NULL DEFAULT 1,
  open_to_helping TINYINT(1) NOT NULL DEFAULT 0,
  visibility ENUM('public','community','private') NOT NULL DEFAULT 'community',
  verification_status ENUM('registered','pending','under_review','verified','rejected','more_info_requested','suspended') NOT NULL DEFAULT 'registered',
  is_indexable TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
  INDEX (country_id, city_id, visibility, verification_status),
  INDEX (verification_status)
) ENGINE=InnoDB;

-- Kept separate from `profiles` on purpose: a public page that does
-- `SELECT * FROM profiles` can never leak these fields just by forgetting a
-- column list (see php/README.md "Security notes").
CREATE TABLE private_contact_info (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profile_id INT UNSIGNED NOT NULL UNIQUE,
  phone_number VARCHAR(50) NULL,
  home_address VARCHAR(255) NULL,
  gov_id_ref VARCHAR(100) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE family_branches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT NULL,
  region VARCHAR(150) NULL,
  historical_information TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE family_branch_memberships (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profile_id INT UNSIGNED NOT NULL,
  branch_id INT UNSIGNED NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_membership (profile_id, branch_id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES family_branches(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE family_relationships (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  from_profile_id INT UNSIGNED NOT NULL,
  to_profile_id INT UNSIGNED NOT NULL,
  relationship_type ENUM('father','mother','son','daughter','brother','sister','spouse','grandfather','grandmother','uncle','aunt','cousin') NOT NULL,
  visibility ENUM('public','community','private') NOT NULL DEFAULT 'private',
  status ENUM('pending','confirmed','declined') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_relationship (from_profile_id, to_profile_id, relationship_type),
  FOREIGN KEY (from_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (to_profile_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- PROFESSIONAL & BUSINESS
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE professional_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE profile_professional_categories (
  profile_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (profile_id, category_id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES professional_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE business_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE businesses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  owner_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  country_id INT UNSIGNED NOT NULL,
  city_id INT UNSIGNED NULL,
  website VARCHAR(255) NULL,
  description TEXT NOT NULL,
  logo_path VARCHAR(255) NULL,
  contact_method VARCHAR(200) NULL,
  status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES business_categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE RESTRICT,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
  INDEX (status, country_id, city_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NULL,
  location VARCHAR(250) NULL,
  country_id INT UNSIGNED NULL,
  city_id INT UNSIGNED NULL,
  organizer_id INT UNSIGNED NOT NULL,
  cover_path VARCHAR(255) NULL,
  requires_rsvp TINYINT(1) NOT NULL DEFAULT 1,
  max_capacity INT UNSIGNED NULL,
  status ENUM('draft','pending_approval','published','completed','cancelled') NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
  FOREIGN KEY (organizer_id) REFERENCES profiles(id) ON DELETE RESTRICT,
  INDEX (status, country_id, city_id)
) ENGINE=InnoDB;

CREATE TABLE event_attendees (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  profile_id INT UNSIGNED NOT NULL,
  status ENUM('going','interested','cancelled') NOT NULL DEFAULT 'going',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_attendee (event_id, profile_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- STORIES
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE story_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE stories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  excerpt VARCHAR(300) NULL,
  body LONGTEXT NOT NULL,
  type ENUM('member','family','heritage','history','achievement','professional_journey','community','global') NOT NULL,
  category_id INT UNSIGNED NULL,
  author_id INT UNSIGNED NULL,
  cover_path VARCHAR(255) NULL,
  status ENUM('draft','pending_review','published','scheduled','rejected','archived') NOT NULL DEFAULT 'draft',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME NULL,
  scheduled_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (category_id) REFERENCES story_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE SET NULL,
  INDEX (status, featured, published_at)
) ENGINE=InnoDB;

CREATE TABLE tags (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE,
  slug VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE story_tags (
  story_id INT UNSIGNED NOT NULL,
  tag_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (story_id, tag_id),
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- MOMENTS
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE moments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  caption VARCHAR(500) NOT NULL,
  type ENUM('celebration','wedding','graduation','birthday','business_achievement','community_gathering','family_gathering','other') NOT NULL,
  submitted_by_id INT UNSIGNED NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  country_id INT UNSIGNED NULL,
  city_id INT UNSIGNED NULL,
  status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (submitted_by_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
  INDEX (status, featured)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- COMMUNITY SUPPORT
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE support_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  requester_id INT UNSIGNED NOT NULL,
  category ENUM('career_guidance','professional_advice','mentorship','relocation_guidance','business_introduction','education_guidance','general_assistance') NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  country_id INT UNSIGNED NULL,
  city_id INT UNSIGNED NULL,
  urgency ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  visibility ENUM('public','community','private') NOT NULL DEFAULT 'community',
  contact_preference ENUM('platform_message','email','either') NOT NULL DEFAULT 'platform_message',
  status ENUM('pending_review','open','in_progress','resolved','closed','rejected') NOT NULL DEFAULT 'pending_review',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
  INDEX (status, category)
) ENGINE=InnoDB;

CREATE TABLE support_offers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  support_request_id INT UNSIGNED NOT NULL,
  helper_id INT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_offer (support_request_id, helper_id),
  FOREIGN KEY (support_request_id) REFERENCES support_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (helper_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- NETWORKING
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE connections (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  requester_id INT UNSIGNED NOT NULL,
  recipient_id INT UNSIGNED NOT NULL,
  status ENUM('pending','accepted','rejected','removed') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME NULL,
  UNIQUE KEY uniq_connection (requester_id, recipient_id),
  FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX (recipient_id, status)
) ENGINE=InnoDB;

CREATE TABLE contact_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  from_id INT UNSIGNED NOT NULL,
  to_id INT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (to_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX (to_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- VERIFICATION & MODERATION
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE verification_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profile_id INT UNSIGNED NOT NULL,
  submission_data JSON NOT NULL,
  status ENUM('pending','under_review','verified','rejected','more_info_requested','suspended') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX (status)
) ENGINE=InnoDB;

CREATE TABLE verification_reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  verification_request_id INT UNSIGNED NOT NULL,
  reviewer_id INT UNSIGNED NOT NULL,
  decision ENUM('approved','rejected','more_info_requested') NOT NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (verification_request_id) REFERENCES verification_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE reports (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT UNSIGNED NOT NULL,
  target_type ENUM('profile','business','story','moment','event','support_request') NOT NULL,
  target_id INT UNSIGNED NOT NULL,
  reason ENUM('fake_profile','incorrect_information','harassment','spam','inappropriate_content','privacy_concern','other') NOT NULL,
  details TEXT NULL,
  status ENUM('open','reviewing','resolved','dismissed') NOT NULL DEFAULT 'open',
  resolved_by_id INT UNSIGNED NULL,
  resolution_note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX (target_type, target_id),
  INDEX (status)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_id INT UNSIGNED NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(50) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (target_type, target_id),
  INDEX (actor_id, created_at)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT UNSIGNED NOT NULL,
  type VARCHAR(50) NOT NULL,
  link VARCHAR(255) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (recipient_id, is_read, created_at)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- CMS & SETTINGS
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE site_settings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_setting (category, setting_key)
) ENGINE=InnoDB;

CREATE TABLE pages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  body LONGTEXT NOT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
