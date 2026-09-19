$file = "d:\SkillCortex\server\routes\jobs.js"
$lines = Get-Content $file
$output = @()
$i = 0

foreach ($line in $lines) {
    if ($i -eq 212) {
        # Close the seedJobsIfEmpty function properly
        $output += "    ]);"
        $output += "}"
        $output += ""
        $output += "// Get all jobs with optional filters and pagination"
        $output += "router.get('/', async (req, res) => {"
        $output += "    try {"
        $output += "        await seedJobsIfEmpty();"
        $output += "        "
        $output += "        const { q, workMode, employmentType, page, limit } = req.query;"
        $output += "        const filter = {};"
        $output += "        "
        $output += "        if (q) {"
        $output += "            const re = new RegExp(q, 'i');"
        $output += "            filter.`$or = [{ title: re }, { company: re }, { description: re }];"
        $output += "        }"
        $output += "        if (workMode) filter.workMode = workMode;"
        $output += "        if (employmentType) filter.employmentType = employmentType;"
        $output += "        "
        $output += "        const pg = Math.max(1, parseInt(page) || 1);"
        $output += "        const lim = Math.max(1, parseInt(limit) || 20);"
        $output += "        const skip = (pg - 1) * lim;"
        $output += "        "
        $output += "        const [jobs, total] = await Promise.all(["
        $output += "            Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),"
        $output += "            Job.countDocuments(filter),"
        $output += "        ]);"
        $output += "        "
        $output += "        res.json({ jobs, total, page: pg, pages: Math.ceil(total / lim) });"
        $output += "    } catch (error) {"
        $output += "        console.error(error);"
        $output += "        res.status(500).send('Server Error');"
        $output += "    }"
        $output += "});"
        $output += ""
        # Skip the orphaned lines (213-219)
        $i = 219
        continue
    }
    
    # Skip orphaned fragment lines
    if ($i -ge 213 -and $i -le 219) {
        $i++
        continue
    }
    
    $output += $line
    $i++
}

$output | Set-Content $file
