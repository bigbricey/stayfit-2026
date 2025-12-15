// Body Fat Calculator - Navy Method
// Using the U.S. Navy body fat calculation formula

(function () {
    'use strict';

    // State
    let gender = 'male';
    let unit = 'imperial';

    // DOM Elements
    const form = document.getElementById('bodyFatForm');
    const resultsPanel = document.getElementById('resultsPanel');
    const formWrapper = document.querySelector('.calculator-form-wrapper');
    const genderBtns = document.querySelectorAll('.gender-btn');
    const unitBtns = document.querySelectorAll('.unit-btn');
    const femaleOnlyFields = document.querySelectorAll('.female-only');
    const recalculateBtn = document.getElementById('recalculateBtn');

    // Initialize
    init();

    function init() {
        // Gender toggle
        genderBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                genderBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gender = btn.dataset.gender;

                // Show/hide hip measurement for females
                femaleOnlyFields.forEach(field => {
                    field.style.display = gender === 'female' ? 'block' : 'none';
                    if (gender === 'female') {
                        field.querySelector('input').required = true;
                    } else {
                        field.querySelector('input').required = false;
                    }
                });
            });
        });

        // Unit toggle
        unitBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                unitBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                unit = btn.dataset.unit;
                updateUnitLabels();
            });
        });

        // Form submission
        form.addEventListener('submit', handleCalculation);

        // Recalculate button
        recalculateBtn.addEventListener('click', showForm);
    }

    function updateUnitLabels() {
        const isMetric = unit === 'metric';
        document.getElementById('heightUnit').textContent = isMetric ? 'cm' : 'inches';
        document.getElementById('weightUnit').textContent = isMetric ? 'kg' : 'lbs';
        document.getElementById('waistUnit').textContent = isMetric ? 'cm' : 'inches';
        document.getElementById('neckUnit').textContent = isMetric ? 'cm' : 'inches';
        document.getElementById('hipUnit').textContent = isMetric ? 'cm' : 'inches';

        // Update placeholders
        document.getElementById('height').placeholder = isMetric ? '175' : '70';
        document.getElementById('weight').placeholder = isMetric ? '82' : '180';
        document.getElementById('waist').placeholder = isMetric ? '86' : '34';
        document.getElementById('neck').placeholder = isMetric ? '38' : '15';
        document.getElementById('hip').placeholder = isMetric ? '97' : '38';
    }

    function handleCalculation(e) {
        e.preventDefault();

        // Get values
        let height = parseFloat(document.getElementById('height').value);
        let weight = parseFloat(document.getElementById('weight').value);
        let waist = parseFloat(document.getElementById('waist').value);
        let neck = parseFloat(document.getElementById('neck').value);
        let hip = gender === 'female' ? parseFloat(document.getElementById('hip').value) : 0;

        // Convert to imperial if metric
        if (unit === 'metric') {
            height = height / 2.54; // cm to inches
            weight = weight * 2.20462; // kg to lbs
            waist = waist / 2.54;
            neck = neck / 2.54;
            hip = hip / 2.54;
        }

        // Validate
        if (!height || !weight || !waist || !neck || (gender === 'female' && !hip)) {
            alert('Please fill in all required fields.');
            return;
        }

        // Show loading
        const btnText = document.querySelector('.btn-text');
        const btnLoading = document.querySelector('.btn-loading');
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';

        // Simulate AI processing
        setTimeout(() => {
            // Calculate body fat using Navy method
            let bodyFat;
            if (gender === 'male') {
                // Male formula: 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
                bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
            } else {
                // Female formula: 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
                bodyFat = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
            }

            // Clamp to reasonable range
            bodyFat = Math.max(3, Math.min(60, bodyFat));

            // Calculate masses
            const fatMass = (bodyFat / 100) * weight;
            const leanMass = weight - fatMass;

            // Display results
            displayResults(bodyFat, fatMass, leanMass, weight);

            // Reset button
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }, 1500);
    }

    function displayResults(bodyFat, fatMass, leanMass, weight) {
        // Hide form, show results
        formWrapper.style.display = 'none';
        resultsPanel.style.display = 'block';

        // Get category
        const category = getCategory(bodyFat, gender);

        // Update display
        const bfNumber = document.getElementById('bfNumber');
        const bfCategory = document.getElementById('bfCategory');

        // Animate number
        animateNumber(bfNumber, 0, Math.round(bodyFat * 10) / 10, 1000);

        // Update category
        bfCategory.textContent = category.name;
        bfCategory.style.color = category.color;

        // Update details
        const weightUnit = unit === 'metric' ? 'kg' : 'lbs';
        const displayFatMass = unit === 'metric' ? fatMass / 2.20462 : fatMass;
        const displayLeanMass = unit === 'metric' ? leanMass / 2.20462 : leanMass;

        document.getElementById('fatMass').textContent = `${displayFatMass.toFixed(1)} ${weightUnit}`;
        document.getElementById('leanMass').textContent = `${displayLeanMass.toFixed(1)} ${weightUnit}`;
        document.getElementById('categoryLabel').textContent = category.name;

        // Animate circle progress
        const progress = document.getElementById('bfProgress');
        const circumference = 339.292; // 2 * PI * 54
        const offset = circumference - (bodyFat / 50) * circumference;
        setTimeout(() => {
            progress.style.strokeDashoffset = offset;
            progress.style.stroke = category.color;
        }, 100);

        // Update chart marker
        const chartMarker = document.getElementById('chartMarker');
        const markerPosition = getMarkerPosition(bodyFat, gender);
        setTimeout(() => {
            chartMarker.style.left = `${markerPosition}%`;
        }, 500);

        // Generate AI recommendation
        generateRecommendation(bodyFat, category, fatMass);

        // Track conversion
        if (typeof gtag === 'function') {
            gtag('event', 'calculator_result', {
                body_fat: bodyFat,
                category: category.name
            });
        }
    }

    function getCategory(bf, gender) {
        const categories = {
            male: [
                { max: 6, name: 'Essential Fat', color: '#10b981' },
                { max: 13, name: 'Athletic', color: '#22c55e' },
                { max: 17, name: 'Fitness', color: '#84cc16' },
                { max: 24, name: 'Average', color: '#eab308' },
                { max: 100, name: 'Obese', color: '#ef4444' }
            ],
            female: [
                { max: 14, name: 'Essential Fat', color: '#10b981' },
                { max: 20, name: 'Athletic', color: '#22c55e' },
                { max: 24, name: 'Fitness', color: '#84cc16' },
                { max: 31, name: 'Average', color: '#eab308' },
                { max: 100, name: 'Obese', color: '#ef4444' }
            ]
        };

        const cats = categories[gender];
        for (const cat of cats) {
            if (bf <= cat.max) return cat;
        }
        return cats[cats.length - 1];
    }

    function getMarkerPosition(bf, gender) {
        // Map body fat to position on chart (0-100%)
        const ranges = gender === 'male'
            ? [6, 13, 17, 24, 50]
            : [14, 20, 24, 31, 50];

        if (bf <= ranges[0]) return (bf / ranges[0]) * 12;
        if (bf <= ranges[1]) return 12 + ((bf - ranges[0]) / (ranges[1] - ranges[0])) * 12;
        if (bf <= ranges[2]) return 24 + ((bf - ranges[1]) / (ranges[2] - ranges[1])) * 10;
        if (bf <= ranges[3]) return 34 + ((bf - ranges[2]) / (ranges[3] - ranges[2])) * 16;
        return Math.min(100, 50 + ((bf - ranges[3]) / (ranges[4] - ranges[3])) * 50);
    }

    function generateRecommendation(bf, category, fatMass) {
        const content = document.getElementById('recommendationContent');
        let html = '';

        if (category.name === 'Obese' || category.name === 'Average') {
            html = `
                <p><strong>Analysis:</strong> Your current body fat of ${bf.toFixed(1)}% puts you in the "${category.name}" category. 
                The good news? You have approximately <strong>${fatMass.toFixed(1)} lbs of fat</strong> that your body can use as fuel.</p>
                <p><strong>Key Insight:</strong> Research shows that stubborn belly fat (visceral fat) is best targeted through 
                <strong>short, strategic workout sequences</strong> rather than long cardio sessions. Extended cardio can actually 
                increase cortisol and promote belly fat storage.</p>
                <p><strong>Recommendation:</strong> A focused 21-day program with movements specifically designed to activate 
                abdominal fat burning would be ideal for your situation.</p>
            `;
        } else if (category.name === 'Fitness') {
            html = `
                <p><strong>Analysis:</strong> At ${bf.toFixed(1)}%, you're in the healthy "Fitness" range. To get to the "Athletic" 
                category, you'd need to lose approximately <strong>${(fatMass * 0.15).toFixed(1)} lbs of fat</strong>.</p>
                <p><strong>Key Insight:</strong> At your level, the last few pounds of belly fat are often the most stubborn. 
                This is due to beta-receptors in abdominal fat cells that resist fat breakdown.</p>
                <p><strong>Recommendation:</strong> Strategic exercise sequencing can help overcome this plateau by triggering 
                specific hormonal responses that target stubborn areas.</p>
            `;
        } else {
            html = `
                <p><strong>Analysis:</strong> At ${bf.toFixed(1)}%, you're already in excellent shape! Your body fat is in the 
                "${category.name}" category.</p>
                <p><strong>Key Insight:</strong> Maintaining this level requires consistent effort. Even athletes can develop 
                stubborn belly fat during periods of stress or reduced activity.</p>
                <p><strong>Recommendation:</strong> To maintain or improve further, focus on progressive workout challenges 
                that keep your body adapting.</p>
            `;
        }

        content.innerHTML = html;
    }

    function animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const diff = end - start;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + diff * eased;

            element.textContent = current.toFixed(1);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function showForm() {
        resultsPanel.style.display = 'none';
        formWrapper.style.display = 'block';
        // Reset progress circle
        document.getElementById('bfProgress').style.strokeDashoffset = 339.292;
    }
})();
