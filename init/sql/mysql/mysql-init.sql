USE acko0;

-- Create policy table
CREATE TABLE IF NOT EXISTS policy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    holder_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    coverage_amount DECIMAL(12, 2) NOT NULL,
    deductible DECIMAL(8, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- Create claim table
CREATE TABLE IF NOT EXISTS claim (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    policy_id INT NOT NULL,
    incident_date DATE NOT NULL,
    filed_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    amount_claimed DECIMAL(10, 2) NOT NULL,
    amount_approved DECIMAL(10, 2)
);

-- Create agent table
CREATE TABLE IF NOT EXISTS agent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    commission_rate DECIMAL(4, 2) NOT NULL
);

-- Insert sample data
INSERT INTO
    agent (
        first_name,
        last_name,
        email,
        phone,
        commission_rate
    )
VALUES
    (
        'Alice',
        'Johnson',
        'alice.johnson@example.com',
        '6969-420',
        10.5
    ),
    (
        'Bob',
        'Williams',
        'bob.williams@example.com',
        '555-4321',
        12.0
    );

INSERT INTO
    policy (
        policy_number,
        holder_id,
        type,
        coverage_amount,
        deductible,
        start_date,
        end_date
    )
VALUES
    (
        'POL-003',
        1,
        'Property',
        500000.00,
        1000.00,
        '2024-08-10',
        '2025-08-09'
    ),
    (
        'POL-004',
        2,
        'Liability',
        1000000.00,
        5000.00,
        '2024-08-15',
        '2025-08-14'
    );

INSERT INTO
    claim (
        claim_number,
        policy_id,
        incident_date,
        filed_date,
        status,
        amount_claimed,
        amount_approved
    )
VALUES
    (
        'CLM-001',
        1,
        '2024-09-15',
        '2024-09-20',
        'In Progress',
        15000.00,
        NULL
    ),
    (
        'CLM-002',
        2,
        '2024-10-01',
        '2024-10-03',
        'Approved',
        50000.00,
        45000.00
    );