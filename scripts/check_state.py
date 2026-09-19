#!/usr/bin/env python3
"""Check the state of all files to understand what's been done."""
import re, os

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Check jobs.js
jpath = os.path.join(base, 'server', 'routes', 'jobs.js')
with open(jpath, 'r', encoding='utf-8') as f:
    jc = f.read()

jobs = re.findall(r"title:\s*'([^']+)'", jc)
print(f"JOBS.JS: {len(jobs)} title: entries")
from collections import Counter
dupes = {t: n for t, n in Counter(jobs).items() if n > 1}
print(f"  Duplicates: {dupes}")
print(f"  Has ']);': {']);' in jc}")
print(f"  Has seedJobsIfEmpty: {'seedJobsIfEmpty' in jc}")
py_true = re.findall(r':\s*True\b', jc)
py_false = re.findall(r':\s*False\b', jc)
print(f"  Python True count: {len(py_true)}, Python False count: {len(py_false)}")

# Check platform.js
ppath = os.path.join(base, 'server', 'routes', 'platform.js')
with open(ppath, 'r', encoding='utf-8') as f:
    pc = f.read()
print(f"\nPLATFORM.JS:")
courses_slugs = re.findall(r"slug: '", pc)
print(f"  Courses seed slugs: {len(courses_slugs)}")
print(f"  Blogs seed: manual check needed")
print(f"  limit(30): {'limit(30)' in pc}")
print(f"  limit(50): {'limit(50)' in pc}")

# Check QuizInterview.jsx
qpath = os.path.join(base, 'client', 'src', 'pages', 'QuizInterview.jsx')
with open(qpath, 'r', encoding='utf-8') as f:
    qc = f.read()
raw_count = qc.count("'") // 2
print(f"\nQUIZINTERVIEW:")
print(f"  Has topicSearch: {'topicSearch' in qc}")
print(f"  Has filteredStacks: {'filteredStacks' in qc}")
print(f"  Maps filteredStacks: {'filteredStacks.map' in qc}")
print(f"  Maps TECH_STACKS: {'TECH_STACKS.map' in qc}")

# Check Jobs.jsx
jopath = os.path.join(base, 'client', 'src', 'pages', 'Jobs.jsx')
with open(jopath, 'r', encoding='utf-8') as f:
    joc = f.read()
print(f"\nJOBS.JSX:")
print(f"  useEffect deps '[]': {'useEffect(() => { fetchJobs(); }, [])' in joc}")
print(f"  Has salaryMin filter: {'salaryMin' in joc}")
print(f"  Has workMode select: {'workMode' in joc}")

# Check Courses.jsx
cpath = os.path.join(base, 'client', 'src', 'pages', 'Courses.jsx')
with open(cpath, 'r', encoding='utf-8') as f:
    cc = f.read()
print(f"\nCOURSES.JSX: {len(cc.splitlines())} lines")
print(f"  Has search: {'search' in cc.lower()}")

# Check Blog.jsx
bpath = os.path.join(base, 'client', 'src', 'pages', 'Blog.jsx')
with open(bpath, 'r', encoding='utf-8') as f:
    bc = f.read()
print(f"\nBLOG.JSX: {len(bc.splitlines())} lines")
print(f"  Has search: {'search' in bc.lower()}")

# Check KB
kpath = os.path.join(base, 'server', 'data', 'knowledgeBase.js')
with open(kpath, 'r', encoding='utf-8') as f:
    kc = f.read()
print(f"\nKNOWLEDGEBASE.JS: {len(re.findall(r':\s', kc))} entries")
print(f"  Has 'java:': {'java:' in kc}")
print(f"  Has 'hooks:': {'hooks:' in kc}")
