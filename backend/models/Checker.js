const pool = require('../config/database');

class Checker {
  // Get all checkers with all fields
  static async getAll() {
    try {
      const result = await pool.query(
        `SELECT 
          id, name, emp_id, designation, education, age, job_period,
          unit, department, line_section,
          test_marks, test_type, test_date, pretest_marks, posttest_marks,
          jan_score, feb_score, mar_score, apr_score, may_score, jun_score,
          jul_score, aug_score, sep_score, oct_score, nov_score, dec_score,
          remarks, created_at, updated_at
        FROM checkers 
        ORDER BY created_at DESC`
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting checkers:', error);
      throw error;
    }
  }

  // Get checker by ID
  static async getById(id) {
    try {
      const result = await pool.query(
        `SELECT 
          id, name, emp_id, designation, education, age, job_period,
          unit, department, line_section,
          test_marks, test_type, test_date, pretest_marks, posttest_marks,
          jan_score, feb_score, mar_score, apr_score, may_score, jun_score,
          jul_score, aug_score, sep_score, oct_score, nov_score, dec_score,
          remarks, created_at, updated_at
        FROM checkers 
        WHERE id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting checker by ID:', error);
      throw error;
    }
  }

  // Create new checker with all fields
  static async create(data) {
    try {
      const { 
        name, emp_id, designation, education, age, job_period,
        unit, department, line_section,
        test_marks, test_type = 'pretest', test_date = new Date().toISOString().split('T')[0],
        pretest_marks, posttest_marks,
        jan_score, feb_score, mar_score, apr_score, may_score, jun_score,
        jul_score, aug_score, sep_score, oct_score, nov_score, dec_score,
        remarks
      } = data;
      
      const result = await pool.query(
        `INSERT INTO checkers (
          name, emp_id, designation, education, age, job_period,
          unit, department, line_section,
          test_marks, test_type, test_date, pretest_marks, posttest_marks,
          jan_score, feb_score, mar_score, apr_score, may_score, jun_score,
          jul_score, aug_score, sep_score, oct_score, nov_score, dec_score,
          remarks
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
        ) RETURNING *`,
        [
          name, emp_id, designation, education, age, job_period,
          unit, department, line_section,
          test_marks, test_type, test_date, pretest_marks || test_marks, posttest_marks,
          jan_score, feb_score, mar_score, apr_score, may_score, jun_score,
          jul_score, aug_score, sep_score, oct_score, nov_score, dec_score,
          remarks
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating checker:', error);
      throw error;
    }
  }

  // Update checker with all fields
  static async update(id, data) {
    try {
      const { 
        name, emp_id, designation, education, age, job_period,
        unit, department, line_section,
        test_marks, test_type, test_date, pretest_marks, posttest_marks,
        jan_score, feb_score, mar_score, apr_score, may_score, jun_score,
        jul_score, aug_score, sep_score, oct_score, nov_score, dec_score,
        remarks
      } = data;
      
      const result = await pool.query(
        `UPDATE checkers 
         SET name = $1, emp_id = $2, designation = $3, education = $4, age = $5, job_period = $6,
             unit = $7, department = $8, line_section = $9,
             test_marks = $10, test_type = $11, test_date = $12, pretest_marks = $13, posttest_marks = $14,
             jan_score = $15, feb_score = $16, mar_score = $17, apr_score = $18,
             may_score = $19, jun_score = $20, jul_score = $21, aug_score = $22,
             sep_score = $23, oct_score = $24, nov_score = $25, dec_score = $26,
             remarks = $27, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $28 RETURNING *`,
        [
          name, emp_id, designation, education, age, job_period,
          unit, department, line_section,
          test_marks, test_type, test_date, pretest_marks, posttest_marks,
          jan_score, feb_score, mar_score, apr_score, may_score, jun_score,
          jul_score, aug_score, sep_score, oct_score, nov_score, dec_score,
          remarks, id
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating checker:', error);
      throw error;
    }
  }

  // Delete checker
  static async delete(id) {
    try {
      await pool.query('DELETE FROM checkers WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting checker:', error);
      throw error;
    }
  }

  // Search checkers with enhanced fields
  static async search(query) {
    try {
      const result = await pool.query(
        `SELECT * FROM checkers 
         WHERE name ILIKE $1 
            OR emp_id ILIKE $1 
            OR unit ILIKE $1 
            OR department ILIKE $1 
            OR line_section ILIKE $1 
            OR designation ILIKE $1
         ORDER BY created_at DESC`,
        [`%${query}%`]
      );
      return result.rows;
    } catch (error) {
      console.error('Error searching checkers:', error);
      throw error;
    }
  }

  // Get performance statistics
  static async getPerformanceStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_checkers,
          AVG(test_marks) as avg_marks,
          MAX(test_marks) as max_marks,
          MIN(test_marks) as min_marks,
          COUNT(CASE WHEN test_type = 'pretest' THEN 1 END) as pretest_count,
          COUNT(CASE WHEN test_type = 'posttest' THEN 1 END) as posttest_count,
          AVG(CASE WHEN test_type = 'pretest' THEN test_marks END) as avg_pretest,
          AVG(CASE WHEN test_type = 'posttest' THEN test_marks END) as avg_posttest
        FROM checkers
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting performance stats:', error);
      throw error;
    }
  }

  // Get performance by unit
  static async getPerformanceByUnit() {
    try {
      const result = await pool.query(`
        SELECT 
          unit,
          COUNT(*) as count,
          AVG(test_marks) as avg_marks,
          MAX(test_marks) as max_marks,
          MIN(test_marks) as min_marks
        FROM checkers
        GROUP BY unit
        ORDER BY avg_marks DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting performance by unit:', error);
      throw error;
    }
  }

  // Get performance by department
  static async getPerformanceByDepartment() {
    try {
      const result = await pool.query(`
        SELECT 
          department,
          COUNT(*) as count,
          AVG(test_marks) as avg_marks,
          MAX(test_marks) as max_marks,
          MIN(test_marks) as min_marks
        FROM checkers
        WHERE department IS NOT NULL
        GROUP BY department
        ORDER BY avg_marks DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting performance by department:', error);
      throw error;
    }
  }

  // Get monthly performance trends
  static async getMonthlyPerformance() {
    try {
      const result = await pool.query(`
        SELECT 
          'January' as month, AVG(jan_score) as avg_score, COUNT(jan_score) as count FROM checkers WHERE jan_score IS NOT NULL
        UNION ALL
          SELECT 'February', AVG(feb_score), COUNT(feb_score) FROM checkers WHERE feb_score IS NOT NULL
        UNION ALL
          SELECT 'March', AVG(mar_score), COUNT(mar_score) FROM checkers WHERE mar_score IS NOT NULL
        UNION ALL
          SELECT 'April', AVG(apr_score), COUNT(apr_score) FROM checkers WHERE apr_score IS NOT NULL
        UNION ALL
          SELECT 'May', AVG(may_score), COUNT(may_score) FROM checkers WHERE may_score IS NOT NULL
        UNION ALL
          SELECT 'June', AVG(jun_score), COUNT(jun_score) FROM checkers WHERE jun_score IS NOT NULL
        UNION ALL
          SELECT 'July', AVG(jul_score), COUNT(jul_score) FROM checkers WHERE jul_score IS NOT NULL
        UNION ALL
          SELECT 'August', AVG(aug_score), COUNT(aug_score) FROM checkers WHERE aug_score IS NOT NULL
        UNION ALL
          SELECT 'September', AVG(sep_score), COUNT(sep_score) FROM checkers WHERE sep_score IS NOT NULL
        UNION ALL
          SELECT 'October', AVG(oct_score), COUNT(oct_score) FROM checkers WHERE oct_score IS NOT NULL
        UNION ALL
          SELECT 'November', AVG(nov_score), COUNT(nov_score) FROM checkers WHERE nov_score IS NOT NULL
        UNION ALL
          SELECT 'December', AVG(dec_score), COUNT(dec_score) FROM checkers WHERE dec_score IS NOT NULL
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting monthly performance:', error);
      throw error;
    }
  }

  // Get performance distribution
  static async getPerformanceDistribution() {
    try {
      const result = await pool.query(`
        SELECT 
          performance_level,
          COUNT(*) as count
        FROM (
          SELECT 
            CASE 
              WHEN test_marks >= 90 THEN 'Excellent (90-100%)'
              WHEN test_marks >= 80 THEN 'Very Good (80-89%)'
              WHEN test_marks >= 70 THEN 'Good (70-79%)'
              WHEN test_marks >= 60 THEN 'Average (60-69%)'
              ELSE 'Needs Improvement (<60%)'
            END as performance_level,
            CASE 
              WHEN test_marks >= 90 THEN 1
              WHEN test_marks >= 80 THEN 2
              WHEN test_marks >= 70 THEN 3
              WHEN test_marks >= 60 THEN 4
              ELSE 5
            END as sort_order
          FROM checkers
        ) subquery
        GROUP BY performance_level, sort_order
        ORDER BY sort_order
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting performance distribution:', error);
      throw error;
    }
  }

  // Get checkers by age group
  static async getByAgeGroup() {
    try {
      const result = await pool.query(`
        SELECT 
          CASE 
            WHEN age < 25 THEN 'Under 25'
            WHEN age BETWEEN 25 AND 30 THEN '25-30'
            WHEN age BETWEEN 31 AND 35 THEN '31-35'
            WHEN age BETWEEN 36 AND 40 THEN '36-40'
            ELSE 'Above 40'
          END as age_group,
          COUNT(*) as count,
          AVG(test_marks) as avg_marks
        FROM checkers
        WHERE age IS NOT NULL
        GROUP BY age_group
        ORDER BY age_group
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting age group stats:', error);
      throw error;
    }
  }

  // Get performance by education level
  static async getByEducation() {
    try {
      const result = await pool.query(`
        SELECT 
          education,
          COUNT(*) as count,
          AVG(test_marks) as avg_marks
        FROM checkers
        WHERE education IS NOT NULL
        GROUP BY education
        ORDER BY avg_marks DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting education stats:', error);
      throw error;
    }
  }
}

module.exports = Checker;
