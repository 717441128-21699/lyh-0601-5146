-- ============================================
-- 在线编程竞赛系统数据库初始化脚本
-- ============================================

CREATE DATABASE IF NOT EXISTS online_judge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE online_judge;

-- 用户表
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    role ENUM('participant', 'admin', 'judge') NOT NULL DEFAULT 'participant',
    organization VARCHAR(100) DEFAULT NULL,
    total_score INT NOT NULL DEFAULT 0,
    total_submissions INT NOT NULL DEFAULT 0,
    rating INT NOT NULL DEFAULT 1500,
    status ENUM('active', 'banned', 'pending') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 竞赛表
DROP TABLE IF EXISTS contests;
CREATE TABLE contests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    cover_image VARCHAR(255) DEFAULT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    registration_start DATETIME NOT NULL,
    registration_end DATETIME NOT NULL,
    type ENUM('individual', 'team') NOT NULL DEFAULT 'individual',
    difficulty ENUM('easy', 'medium', 'hard', 'expert') NOT NULL DEFAULT 'medium',
    max_participants INT DEFAULT NULL,
    anti_cheat_threshold DECIMAL(5,2) NOT NULL DEFAULT 0.85,
    check_point_count INT NOT NULL DEFAULT 3,
    status ENUM('draft', 'registering', 'ongoing', 'ended', 'cancelled') NOT NULL DEFAULT 'draft',
    organizer VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 竞赛组别表
DROP TABLE IF EXISTS contest_groups;
CREATE TABLE contest_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) DEFAULT NULL,
    capacity INT NOT NULL,
    min_rating INT DEFAULT NULL,
    max_rating INT DEFAULT NULL,
    current_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    INDEX idx_contest (contest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 题目表
DROP TABLE IF EXISTS problems;
CREATE TABLE problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    group_id INT DEFAULT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    input_description TEXT,
    output_description TEXT,
    sample_input TEXT,
    sample_output TEXT,
    hint TEXT,
    type ENUM('objective', 'subjective') NOT NULL DEFAULT 'objective',
    difficulty ENUM('easy', 'medium', 'hard', 'expert') NOT NULL DEFAULT 'medium',
    time_limit INT NOT NULL DEFAULT 1000,
    memory_limit INT NOT NULL DEFAULT 128,
    score INT NOT NULL DEFAULT 100,
    test_cases JSON DEFAULT NULL,
    standard_answer TEXT,
    judge_weight JSON DEFAULT NULL,
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES contest_groups(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_contest (contest_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 报名表
DROP TABLE IF EXISTS registrations;
CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contest_id INT NOT NULL,
    group_id INT DEFAULT NULL,
    track_number INT DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    credential_code VARCHAR(50) UNIQUE,
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME DEFAULT NULL,
    remark VARCHAR(500) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES contest_groups(id) ON DELETE SET NULL,
    UNIQUE KEY uk_user_contest (user_id, contest_id),
    INDEX idx_contest (contest_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 提交记录表
DROP TABLE IF EXISTS submissions;
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contest_id INT NOT NULL,
    problem_id INT NOT NULL,
    registration_id INT NOT NULL,
    language VARCHAR(20) NOT NULL,
    code TEXT NOT NULL,
    code_hash VARCHAR(64) DEFAULT NULL,
    status ENUM('pending', 'judging', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compile_error', 'cheating') NOT NULL DEFAULT 'pending',
    score INT NOT NULL DEFAULT 0,
    execution_time INT DEFAULT NULL,
    execution_memory INT DEFAULT NULL,
    test_case_passed INT DEFAULT 0,
    test_case_total INT DEFAULT 0,
    judge_log TEXT,
    is_cheating TINYINT(1) NOT NULL DEFAULT 0,
    cheating_similarity DECIMAL(5,4) DEFAULT NULL,
    cheating_compared_with INT DEFAULT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    judged_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    INDEX idx_user_contest (user_id, contest_id),
    INDEX idx_problem (problem_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评委评分表
DROP TABLE IF EXISTS judge_scores;
CREATE TABLE judge_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    judge_id INT NOT NULL,
    score INT NOT NULL,
    comment TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (judge_id) REFERENCES users(id),
    UNIQUE KEY uk_submission_judge (submission_id, judge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 实时排名表
DROP TABLE IF EXISTS rankings;
CREATE TABLE rankings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    group_id INT DEFAULT NULL,
    user_id INT NOT NULL,
    registration_id INT NOT NULL,
    total_score INT NOT NULL DEFAULT 0,
    total_solved INT NOT NULL DEFAULT 0,
    total_time INT NOT NULL DEFAULT 0,
    rank INT DEFAULT NULL,
    last_submission_at DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES contest_groups(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_contest_user (contest_id, user_id),
    INDEX idx_rank (contest_id, rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 消息通知表
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('registration', 'score', 'cheating', 'certificate', 'system') NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    related_id INT DEFAULT NULL,
    related_type VARCHAR(50) DEFAULT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 反作弊检测记录
DROP TABLE IF EXISTS anti_cheat_records;
CREATE TABLE anti_cheat_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    submission_id INT NOT NULL,
    check_point INT NOT NULL,
    user_id INT NOT NULL,
    compared_submission_id INT DEFAULT NULL,
    compared_user_id INT DEFAULT NULL,
    similarity DECIMAL(5,4) NOT NULL,
    status ENUM('pending', 'confirmed', 'dismissed') NOT NULL DEFAULT 'pending',
    reviewed_by INT DEFAULT NULL,
    reviewed_at DATETIME DEFAULT NULL,
    review_note VARCHAR(500) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_contest (contest_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 证书/成绩单表
DROP TABLE IF EXISTS certificates;
CREATE TABLE certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contest_id INT NOT NULL,
    registration_id INT NOT NULL,
    type ENUM('participation', 'rank', 'award') NOT NULL,
    award_level VARCHAR(50) DEFAULT NULL,
    final_rank INT DEFAULT NULL,
    final_score INT DEFAULT NULL,
    certificate_number VARCHAR(50) UNIQUE,
    certificate_url VARCHAR(255) DEFAULT NULL,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_contest (contest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 运营报表表
DROP TABLE IF EXISTS operation_reports;
CREATE TABLE operation_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_date DATE NOT NULL,
    contest_id INT DEFAULT NULL,
    total_participants INT NOT NULL DEFAULT 0,
    average_score DECIMAL(10,2) NOT NULL DEFAULT 0,
    pass_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_submissions INT NOT NULL DEFAULT 0,
    cheating_count INT NOT NULL DEFAULT 0,
    report_data JSON,
    is_pushed TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE SET NULL,
    UNIQUE KEY uk_date_contest (report_date, contest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认管理员 (密码: admin123)
INSERT INTO users (username, email, password, real_name, role, organization, status) VALUES
('admin', 'admin@oj.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 'admin', '竞赛组委会', 'active'),
('judge01', 'judge01@oj.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '评委甲', 'judge', '算法专家委员会', 'active'),
('judge02', 'judge02@oj.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '评委乙', 'judge', '算法专家委员会', 'active');

-- 插入示例参赛者 (密码: user123)
INSERT INTO users (username, email, password, real_name, role, organization, rating, total_score, status) VALUES
('alice', 'alice@oj.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '爱丽丝', 'participant', '清华大学', 1800, 2500, 'active'),
('bob', 'bob@oj.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '鲍勃', 'participant', '北京大学', 1650, 1800, 'active'),
('charlie', 'charlie@oj.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '查理', 'participant', '浙江大学', 1500, 1200, 'active'),
('david', 'david@oj.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '大卫', 'participant', '上海交通大学', 1400, 800, 'active'),
('eve', 'eve@oj.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '夏娃', 'participant', '复旦大学', 1550, 1500, 'active');

-- 插入示例竞赛
INSERT INTO contests (title, description, start_time, end_time, registration_start, registration_end, type, difficulty, max_participants, anti_cheat_threshold, check_point_count, status, organizer, created_by) VALUES
('2026全国大学生算法设计大赛', '面向全国高校大学生的算法设计竞赛，考察数据结构、动态规划、图论等核心算法知识。', '2026-07-15 09:00:00', '2026-07-15 14:00:00', '2026-06-01 00:00:00', '2026-07-10 23:59:59', 'individual', 'hard', 500, 0.85, 3, 'registering', '全国大学生计算机教育联盟', 1),
('新手编程挑战赛', '专为编程初学者设计的入门级竞赛，题目涵盖基础语法和简单算法。', '2026-06-20 14:00:00', '2026-06-20 17:00:00', '2026-06-05 00:00:00', '2026-06-18 23:59:59', 'individual', 'easy', 1000, 0.90, 2, 'ongoing', '平台运营组', 1);

-- 插入竞赛组别
INSERT INTO contest_groups (contest_id, name, description, capacity, min_rating, max_rating) VALUES
(1, '高级组（精英赛道）', '面向高水平选手，Rating >= 1700', 100, 1700, NULL),
(1, '中级组（挑战赛道）', '面向中等水平选手，Rating 1400-1699', 250, 1400, 1699),
(1, '初级组（成长赛道）', '面向入门选手，Rating < 1400', 150, NULL, 1399),
(2, '公开组', '所有选手均可参加', 1000, NULL, NULL);

-- 插入示例题目
INSERT INTO problems (contest_id, group_id, title, description, input_description, output_description, sample_input, sample_output, type, difficulty, time_limit, memory_limit, score, test_cases, created_by) VALUES
(1, 1, '最短路径问题', '给定一个带权有向图，求从起点到终点的最短路径长度。', '第一行包含两个整数n和m，表示节点数和边数。接下来m行每行三个整数u,v,w表示一条有向边。', '输出最短路径长度，若不可达输出-1。', '4 4\n1 2 1\n2 3 2\n3 4 3\n1 4 10', '6', 'objective', 'hard', 2000, 256, 100, '[{"input":"4 4\\n1 2 1\\n2 3 2\\n3 4 3\\n1 4 10","output":"6"},{"input":"3 2\\n1 2 5\\n1 3 10","output":"5"}]', 1),
(1, 2, '动态规划入门', '求斐波那契数列的第n项。', '输入一个整数n。', '输出斐波那契数列第n项对10^9+7取模的结果。', '10', '55', 'objective', 'medium', 1000, 128, 100, '[{"input":"10","output":"55"},{"input":"20","output":"6765"}]', 1),
(1, 3, '数组求和', '计算给定数组中所有元素的和。', '第一行输入n，第二行输入n个整数。', '输出数组元素之和。', '5\n1 2 3 4 5', '15', 'objective', 'easy', 1000, 64, 100, '[{"input":"5\\n1 2 3 4 5","output":"15"},{"input":"3\\n10 20 30","output":"60"}]', 1),
(2, 4, 'Hello World', '输出Hello World。', '无输入。', '输出"Hello World"。', '', 'Hello World', 'objective', 'easy', 1000, 64, 100, '[{"input":"","output":"Hello World"}]', 1),
(2, 4, '算法设计论述题', '请论述你对时间复杂度和空间复杂度的理解，并举例说明在实际开发中如何权衡二者。', '无输入，提交文字答案。', '由评委根据内容质量进行打分。', '', '', 'subjective', 'medium', 0, 0, 100, NULL, 1);

-- 插入示例报名记录
INSERT INTO registrations (user_id, contest_id, group_id, track_number, status, credential_code, registered_at, approved_at) VALUES
(4, 1, 1, 1, 'approved', 'CRED-2026-00001', '2026-06-02 10:30:00', '2026-06-02 10:30:00'),
(5, 1, 2, 1, 'approved', 'CRED-2026-00002', '2026-06-03 14:20:00', '2026-06-03 14:20:00'),
(6, 1, 2, 2, 'approved', 'CRED-2026-00003', '2026-06-03 15:00:00', '2026-06-03 15:00:00'),
(7, 1, 3, 1, 'approved', 'CRED-2026-00004', '2026-06-04 09:15:00', '2026-06-04 09:15:00'),
(8, 1, 2, 3, 'approved', 'CRED-2026-00005', '2026-06-05 11:45:00', '2026-06-05 11:45:00'),
(4, 2, 4, 1, 'approved', 'CRED-2026-00006', '2026-06-06 08:00:00', '2026-06-06 08:00:00'),
(5, 2, 4, 2, 'approved', 'CRED-2026-00007', '2026-06-06 09:30:00', '2026-06-06 09:30:00');
