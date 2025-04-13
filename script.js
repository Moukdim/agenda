document.addEventListener('DOMContentLoaded', () => {
    const calendarDays = document.getElementById('calendarDays');
    const monthYear = document.getElementById('monthYear');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    const appointmentsTableBody = document.getElementById('appointmentsTableBody');
    const appointmentForm = document.getElementById('appointmentForm');

    let currentDate = new Date();
    let appointments = [];

    // Afficher le calendrier
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Ajuster pour commencer le lundi

        monthYear.textContent = `${currentDate.toLocaleString('fr-FR', { month: 'long' })} ${year}`;
        calendarDays.innerHTML = '';

        // Ajouter des jours vides avant le premier jour
        for (let i = 0; i < adjustedFirstDay; i++) {
            calendarDays.innerHTML += `<div class="day"></div>`;
        }

        // Ajouter les jours du mois
        for (let i = 1; i <= lastDate; i++) {
            const date = new Date(year, month, i);
            const dayAppointments = appointments.filter(app => {
                const appDate = new Date(app.dateTime);
                return appDate.getDate() === i && appDate.getMonth() === month && appDate.getFullYear() === year;
            });

            let appointmentsHTML = dayAppointments.map(app => `<div class="appointment">${app.fullName}</div>`).join('');
            calendarDays.innerHTML += `<div class="day"><span>${i}</span>${appointmentsHTML}</div>`;
        }
    }

    // Afficher le tableau des rendez-vous
    function renderTable() {
        appointmentsTableBody.innerHTML = '';
        appointments.forEach(app => {
            const appDate = new Date(app.dateTime);
            appointmentsTableBody.innerHTML += `
                <tr>
                    <td>${appDate.toLocaleDateString('fr-FR')}</td>
                    <td>${appDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>${app.fullName}</td>
                    <td>${app.convention}</td>
                    <td>${app.diagnosis}</td>
                    <td>${app.doctor}</td>
                </tr>
            `;
        });
    }

    // Ajouter un rendez-vous avec répétition
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const convention = document.getElementById('convention').value;
        const diagnosis = document.getElementById('diagnosis').value;
        const doctor = document.getElementById('doctor').value;
        const dateTime = document.getElementById('dateTime').value;
        const repeatDays = parseInt(document.getElementById('repeatDays').value);
        const selectedDays = Array.from(document.querySelectorAll('.checkbox-group input:checked')).map(input => input.value);

        if (selectedDays.length === 0) {
            alert("Veuillez sélectionner au moins un jour pour la répétition.");
            return;
        }

        const baseDate = new Date(dateTime);
        let repetitionsAdded = 0;
        let dayOffset = 0;

        // Continuer à ajouter des rendez-vous jusqu'à atteindre le nombre de répétitions demandé
        while (repetitionsAdded < repeatDays) {
            const newDate = new Date(baseDate);
            newDate.setDate(baseDate.getDate() + dayOffset);

            const dayOfWeekStr = newDate.toLocaleString('fr-FR', { weekday: 'short' }).slice(0, 3);
            const dayOfWeekFormatted = dayOfWeekStr.charAt(0).toUpperCase() + dayOfWeekStr.slice(1).toLowerCase();

            if (selectedDays.includes(dayOfWeekFormatted)) {
                appointments.push({
                    fullName,
                    convention,
                    diagnosis,
                    doctor,
                    dateTime: newDate.toISOString()
                });
                repetitionsAdded++;
            }

            dayOffset++;
        }

        // Trier les rendez-vous par date
        appointments.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

        renderCalendar();
        renderTable();
        appointmentForm.reset();
    });

    // Navigation dans le calendrier
    prevMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Imprimer les rendez-vous avec une mise en page stylisée
    window.printAppointments = function() {
        const printWindow = window.open('', '_blank');
        const printDate = new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        // Regrouper les rendez-vous par Nom et Prénom, Convention, Diagnostic, Médecin traitant
        const groupedAppointments = {};
        appointments.forEach(app => {
            const key = `${app.fullName}|${app.convention}|${app.diagnosis}|${app.doctor}`;
            if (!groupedAppointments[key]) {
                groupedAppointments[key] = {
                    fullName: app.fullName,
                    convention: app.convention,
                    diagnosis: app.diagnosis,
                    doctor: app.doctor,
                    dates: []
                };
            }
            groupedAppointments[key].dates.push(new Date(app.dateTime));
        });

        // Générer la liste des informations (Nom, Convention, Diagnostic, Médecin traitant)
        let detailsHTML = '';
        Object.values(groupedAppointments).forEach(group => {
            detailsHTML += `
                <div class="appointment-details">
                    <p><strong>Nom et Prénom :</strong> ${group.fullName}</p>
                    <p><strong>Convention :</strong> ${group.convention}</p>
                    <p><strong>Diagnostic :</strong> ${group.diagnosis}</p>
                    <p><strong>Médecin traitant :</strong> ${group.doctor}</p>
                </div>
            `;
        });

        // Générer le tableau avec uniquement Date et Heure
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Heure</th>
                    </tr>
                </thead>
                <tbody>
        `;
        appointments.forEach(app => {
            const appDate = new Date(app.dateTime);
            tableHTML += `
                <tr>
                    <td>${appDate.toLocaleDateString('fr-FR')}</td>
                    <td>${appDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
            `;
        });
        tableHTML += `</tbody></table>`;

        printWindow.document.write(`
            <html>
            <head>
                <title>Liste des Rendez-vous</title>
                <style>
                    @page {
                        size: A4;
                        margin: 0mm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    .print-container {
                        width: 100%;
                        max-width: 210mm; /* Largeur A4 */
                        margin: 0 auto;
                        padding: 10mm;
                        background: #fff;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid rgb(5, 0, 7);
                        padding-bottom: 10px;
                    }
                    .print-header h1 {
                        color:rgb(1, 0, 2);
                        font-size: 24px;
                        margin: 0;
                    }
                    .print-header p {
                        color: #666;
                        font-size: 14px;
                        margin: 5px 0 0;
                    }
                    .appointment-details {
                        margin-bottom: 15px;
                        padding: 10px;
                        border: 1px solid rgb(0, 0, 0);;
                        border-radius: 5px;
                        background: #f9f9f9;
                    }
                    .appointment-details p {
                        margin: 5px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        padding: 5px;
                        text-align: left;
                        border: 1px solid rgb(0, 0, 0);
                        
                    }
                    th {
                        background:rgb(255, 255, 255);
                        color: rgb(0, 0, 0);;
                        font-weight: bold;
                    }
                    td {
                        background: #f9f9f9;
                        height:5px;
                    }
                    tr:nth-child(even) td {
                        background: #f1f1f1;
                        height:5px;
                            -webkit-border-vertical-spacing: 5px;

                    }
                    .print-footer {
                        position: fixed;
                        bottom: 10mm;
                        width: 100%;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        border-top: 1px solid #ddd;
                        padding-top: 5px;
                    }
                           .entete{
                        display:flex;
                        justify-content:space-between;
                        height:200px;
                        margin-top:0px;
                        margin-bottom:20px;
                        }
                        .hmoed{
                        with:100px;
                        height:100px;
                        texte-aligne:center;
                        line-height:30px;
                        margin-top:0;
                        }
                        img{
                         with:150px;
                        height:150px;
                        }
                        h1{
                        margin-top:10px;
                        }
                    @media print {
                        .print-footer {
                            position: fixed;
                            bottom: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    
                    <div class="print-header">
                      <div class="entete">
                      <div class="hmoed">
                      <h6>HOPITAL MILITAIRE<br>OUED EDDAHAB<br>MEDECINE PHYSIQUE<br>ET READAPTATION FONCTIONNELLE<br>-AGADIR-<h6/>
                    </div>
                    <img src="images/logo-hmoed.png" alt="images/logo-hmoed.png">
                    </div>

                        <h1>Liste des Rendez-vous</h1>
                        <p>Imprimé le ${printDate}</p>
                    </div>
                    <div class="appointments-info">
                        ${detailsHTML}
                    </div>
                    ${tableHTML}
            <p>signature:<p/>

                    
                </div>
            </body>
            </html>
        `);

        // Ajouter le numéro de page dynamiquement
        const totalPages = Math.ceil(printWindow.document.querySelectorAll('tr').length / 20); // Estimation
        const pageNumbers = printWindow.document.querySelectorAll('.page-number');
        pageNumbers.forEach((elem, index) => {
            elem.textContent = `${index + 1} / ${totalPages}`;
        });

        printWindow.document.close();
        printWindow.print();
    };

    // Exporter les rendez-vous en CSV
    window.exportAppointments = function() {
        let csv = 'Date;Heure;Nom et Prénom;Convention;Diagnostic;Médecin traitant\n';
        appointments.forEach(app => {
            const appDate = new Date(app.dateTime);
            csv += `${appDate.toLocaleDateString('fr-FR')};${appDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })};${app.fullName};${app.convention};${app.diagnosis};${app.doctor}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rendez-vous.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Exporter les rendez-vous en PDF
    window.exportToPDF = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Liste des Rendez-vous', 10, 10);

        const table = document.getElementById('appointmentsTable');
        doc.autoTable({
            html: table,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [155, 89, 182] }, // Couleur violette pour l'en-tête
            styles: { fontSize: 10 }
        });

        doc.save('rendez-vous.pdf');
    };

    // Exporter les rendez-vous en Word (DOCX)
    window.exportToWord = function() {
        const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle } = window.docx;

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "Liste des Rendez-vous",
                        heading: "Heading1",
                        alignment: "center"
                    }),
                    new Paragraph({ text: "" }) // Espace
                ]
            }]
        });

        const tableRows = [];

        const headerRow = new TableRow({
            children: [
                new TableCell({ children: [new Paragraph("Date")] }),
                new TableCell({ children: [new Paragraph("Heure")] }),
                new TableCell({ children: [new Paragraph("Nom et Prénom")] }),
                new TableCell({ children: [new Paragraph("Convention")] }),
                new TableCell({ children: [new Paragraph("Diagnostic")] }),
                new TableCell({ children: [new Paragraph("Médecin traitant")] })
            ]
        });
        tableRows.push(headerRow);

        appointments.forEach(app => {
            const appDate = new Date(app.dateTime);
            const row = new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(appDate.toLocaleDateString('fr-FR'))] }),
                    new TableCell({ children: [new Paragraph(appDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))] }),
                    new TableCell({ children: [new Paragraph(app.fullName)] }),
                    new TableCell({ children: [new Paragraph(app.convention)] }),
                    new TableCell({ children: [new Paragraph(app.diagnosis)] }),
                    new TableCell({ children: [new Paragraph(app.doctor)] })
                ]
            });
            tableRows.push(row);
        });

        const table = new Table({
            rows: tableRows,
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            borders: {
                top: { style: BorderStyle.SINGLE },
                bottom: { style: BorderStyle.SINGLE },
                left: { style: BorderStyle.SINGLE },
                right: { style: BorderStyle.SINGLE },
                insideHorizontal: { style: BorderStyle.SINGLE },
                insideVertical: { style: BorderStyle.SINGLE }
            }
        });

        doc.addSection({ children: [table] });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "rendez-vous.docx");
        });
    };

    // Rendu initial
    renderCalendar();
    renderTable();
});