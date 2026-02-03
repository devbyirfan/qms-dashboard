-- ============================================
-- COMPLETE QMS DATABASE SCHEMA
-- For pgAdmin Query Tool
-- ============================================

-- IMPORTANT: This shows the COMPLETE table structure
-- Only use this if you want to see the full schema
-- To UPDATE existing database, use: update_database_pgadmin.sql

-- ============================================
-- USERS TABLE
-- ============================================

-- Drop if recreating (CAUTION: This deletes data!)
-- DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CHECKERS TABLE - COMPLETE STRUCTURE
-- ============================================

-- Drop if recreating (CAUTION: This deletes data!)
-- DROP TABLE IF EXISTS checkers CASCADE;

CREATE TABLE IF NOT EXISTS checkers (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Employee Information
    name VARCHAR(150) NOT NULL,
    emp_id VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(100),
    education VARCHAR(100),
    age INTEGER,
    job_period VARCHAR(50),
    
    -- Organizational Structure
    unit VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    line_section VARCHAR(100),
    
    -- Test Information
    test_marks DECIMAL(5,2) NOT NULL,
    test_type VARCHAR(20) DEFAULT 'pretest',
    test_date DATE DEFAULT CURRENT_DATE,
    pretest_marks DECIMAL(5,2),
    posttest_marks DECIMAL(5,2),
    
    -- Monthly Assessment Scores
    jan_score DECIMAL(5,2),
    feb_score DECIMAL(5,2),
    mar_score DECIMAL(5,2),
    apr_score DECIMAL(5,2),
    may_score DECIMAL(5,2),
    jun_score DECIMAL(5,2),
    jul_score DECIMAL(5,2),
    aug_score DECIMAL(5,2),
    sep_score DECIMAL(5,2),
    oct_score DECIMAL(5,2),
    nov_score DECIMAL(5,2),
    dec_score DECIMAL(5,2),
    
    -- Additional Information
    remarks TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_checkers_emp_id ON checkers(emp_id);
CREATE INDEX IF NOT EXISTS idx_checkers_unit ON checkers(unit);
CREATE INDEX IF NOT EXISTS idx_checkers_department ON checkers(department);
CREATE INDEX IF NOT EXISTS idx_checkers_line_section ON checkers(line_section);
CREATE INDEX IF NOT EXISTS idx_checkers_test_date ON checkers(test_date);
CREATE INDEX IF NOT EXISTS idx_checkers_test_type ON checkers(test_type);
CREATE INDEX IF NOT EXISTS idx_checkers_age ON checkers(age);
CREATE INDEX IF NOT EXISTS idx_checkers_designation ON checkers(designation);

-- ============================================
-- SAMPLE ADMIN USER
-- Username: admin
-- Password: admin123
-- ============================================

-- Only insert if doesn't exist
INSERT INTO users (username, email, password, role) 
SELECT 'admin', 'admin@qms.com', '$2a$10$rZP.FvBqJZGj1Xy8WQmz4eN8KzQ5JZGj1Xy8WQmz4eN8KzQ5JZGj1', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- ============================================
-- SAMPLE CHECKERS DATA WITH ALL NEW FIELDS
-- ============================================

-- Only insert sample data if table is empty
INSERT INTO checkers (
    name, emp_id, designation, education, age, job_period,
    unit, department, line_section, 
    test_marks, test_type, test_date,
    pretest_marks, posttest_marks,
    jan_score, feb_score, mar_score, apr_score,
    remarks
)
SELECT * FROM (VALUES
    (
        'Ali Raza', 'EMP001', 'Quality Inspector', 'Bachelor in Textile', 28, '3 years',
        'Production', 'Quality Assurance', 'Line A',
        85.50, 'pretest', '2024-01-15'::date,
        85.50, 92.00,
        85.50, 88.00, 90.00, 92.00,
        'Excellent performance, shows consistent improvement'
    ),
    (
        'Fatima Khan', 'EMP002', 'Senior QC Checker', 'Masters in Quality Management', 32, '5 years',
        'Quality', 'Quality Control', 'Section B',
        92.00, 'posttest', '2024-01-20'::date,
        88.00, 92.00,
        88.00, 90.00, 91.00, 92.00,
        'Outstanding performer, team leader'
    ),
    (
        'Ahmed Hassan', 'EMP003', 'Junior Inspector', 'Diploma in Garments', 24, '1 year',
        'Assembly', 'Production', 'Line C',
        78.25, 'pretest', '2024-01-18'::date,
        78.25, NULL,
        78.25, 80.00, 82.00, NULL,
        'Good potential, needs more training'
    ),
    (
        'Sana Malik', 'EMP004', 'QC Analyst', 'Bachelor in Industrial Engineering', 29, '4 years',
        'Testing', 'Quality Testing', 'Lab Section',
        88.75, 'posttest', '2024-01-22'::date,
        84.00, 88.75,
        84.00, 86.00, 87.50, 88.75,
        'Very good analytical skills'
    ),
    (
        'Bilal Ahmed', 'EMP005', 'Quality Checker', 'HSC', 26, '2 years',
        'Production', 'Manufacturing', 'Line D',
        75.00, 'pretest', '2024-01-25'::date,
        75.00, NULL,
        75.00, 76.00, 77.00, NULL,
        'Average performance, regular attendance'
    )
) AS sample_data(name, emp_id, designation, education, age, job_period, unit, department, line_section, 
                 test_marks, test_type, test_date, pretest_marks, posttest_marks, 
                 jan_score, feb_score, mar_score, apr_score, remarks)
WHERE NOT EXISTS (SELECT 1 FROM checkers WHERE emp_id = sample_data.emp_id);

-- ============================================
-- VIEW: Monthly Performance Analysis
-- ============================================

CREATE OR REPLACE VIEW monthly_performance_view AS
SELECT 
    emp_id,
    name,
    unit,
    department,
    
    -- Monthly scores
    COALESCE(jan_score, 0) as jan_score,
    COALESCE(feb_score, 0) as feb_score,
    COALESCE(mar_score, 0) as mar_score,
    COALESCE(apr_score, 0) as apr_score,
    COALESCE(may_score, 0) as may_score,
    COALESCE(jun_score, 0) as jun_score,
    COALESCE(jul_score, 0) as jul_score,
    COALESCE(aug_score, 0) as aug_score,
    COALESCE(sep_score, 0) as sep_score,
    COALESCE(oct_score, 0) as oct_score,
    COALESCE(nov_score, 0) as nov_score,
    COALESCE(dec_score, 0) as dec_score,
    
    -- Overall average
    (
        COALESCE(jan_score, 0) + COALESCE(feb_score, 0) + COALESCE(mar_score, 0) + 
        COALESCE(apr_score, 0) + COALESCE(may_score, 0) + COALESCE(jun_score, 0) + 
        COALESCE(jul_score, 0) + COALESCE(aug_score, 0) + COALESCE(sep_score, 0) + 
        COALESCE(oct_score, 0) + COALESCE(nov_score, 0) + COALESCE(dec_score, 0)
    ) / 
    NULLIF((
        CASE WHEN jan_score IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN feb_score IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN mar_score IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN apr_score IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN may_score IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN jun_score IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN jul_score IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN aug_score IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN sep_score IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oct_score IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN nov_score IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN dec_score IS NOT NULL THEN 1 ELSE 0 END
    ), 0) as avg_yearly_score
FROM checkers;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check table structure
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'checkers' 
ORDER BY ordinal_position;

-- Check data count
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 
    'checkers' as table_name, 
    COUNT(*) as record_count 
FROM checkers;

-- Check sample data
SELECT 
    name, 
    emp_id, 
    designation, 
    department, 
    unit, 
    test_marks,
    jan_score,
    feb_score
FROM checkers 
LIMIT 5;


ALTER TABLE checkers 
ADD COLUMN profile_picture VARCHAR(500) DEFAULT NULL,
ADD COLUMN picture_filename VARCHAR(255) DEFAULT NULL;