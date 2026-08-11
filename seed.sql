-- 1. Create the Users Table (Optional for this prototype, but good for foreign keys)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL CHECK (role IN ('Client_SME', 'Freelancer')),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the Projects Table
CREATE TABLE IF NOT EXISTS public.projects (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.users(id),
    freelancer_id UUID REFERENCES public.users(id),
    title TEXT NOT NULL,
    total_budget NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Draft', 'Active', 'Completed', 'Disputed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the Milestones Table
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Unfunded', 'Funded_in_Escrow', 'Approved', 'Paid_Out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Insert Dummy Users
INSERT INTO public.users (id, role, name, email) VALUES 
('11111111-1111-1111-1111-111111111111', 'Client_SME', 'Acme Corp', 'client@acme.com'),
('22222222-2222-2222-2222-222222222222', 'Freelancer', 'John Doe', 'john@doe.com');

-- 5. Insert a Dummy Project
INSERT INTO public.projects (id, client_id, freelancer_id, title, total_budget, status) VALUES 
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Saviya App Development', 700000, 'Active');

-- 6. Insert Dummy Milestones
INSERT INTO public.milestones (project_id, milestone_name, amount, status) VALUES 
('33333333-3333-3333-3333-333333333333', 'Figma UI/UX Design Approval', 150000, 'Paid_Out'),
('33333333-3333-3333-3333-333333333333', 'Frontend Development', 300000, 'Approved'),
('33333333-3333-3333-3333-333333333333', 'Backend Integration', 250000, 'Unfunded');

-- 7. Insert an Active Dispute (For the Admin Dashboard)
INSERT INTO public.projects (id, client_id, freelancer_id, title, total_budget, status) VALUES 
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'E-Commerce React Migration', 450000, 'Disputed');
