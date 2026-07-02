ALTER TABLE supplier_companies
ADD COLUMN contact_person VARCHAR(255) NOT NULL DEFAULT 'Not Specified',
ADD COLUMN address VARCHAR(255) NOT NULL DEFAULT 'Not Specified';

-- Remove the default values after adding the columns
ALTER TABLE supplier_companies
ALTER COLUMN contact_person DROP DEFAULT,
ALTER COLUMN address DROP DEFAULT; 