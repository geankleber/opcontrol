#!/usr/bin/env node

/**
 * Gerador de Arquivos Excel para UHE Teles Pires
 *
 * Uso:
 *   node generate-excel.js
 *
 * Pré-requisito:
 *   npm install xlsx
 */

const XLSX = require('xlsx');

// Dados de exemplo (48 pontos - 00:00 a 23:30)
const dataExemplo = [
    { hora: '00:00', pdp: 1790, geracao: 1785 },
    { hora: '00:30', pdp: 1790, geracao: 1792 },
    { hora: '01:00', pdp: 1790, geracao: 1788 },
    { hora: '01:30', pdp: 1790, geracao: 1795 },
    { hora: '02:00', pdp: 1790, geracao: 1787 },
    { hora: '02:30', pdp: 1790, geracao: 1791 },
    { hora: '03:00', pdp: 1790, geracao: 1789 },
    { hora: '03:30', pdp: 1790, geracao: 1793 },
    { hora: '04:00', pdp: 1790, geracao: 1786 },
    { hora: '04:30', pdp: 1790, geracao: 1790 },
    { hora: '05:00', pdp: 1790, geracao: 1794 },
    { hora: '05:30', pdp: 1790, geracao: 1788 },
    { hora: '06:00', pdp: 1790, geracao: 1791 },
    { hora: '06:30', pdp: 1790, geracao: 1787 },
    { hora: '07:00', pdp: 1790, geracao: 1792 },
    { hora: '07:30', pdp: 1790, geracao: 1789 },
    { hora: '08:00', pdp: 1790, geracao: 1793 },
    { hora: '08:30', pdp: 1790, geracao: 1786 },
    { hora: '09:00', pdp: 1790, geracao: 1795 },
    { hora: '09:30', pdp: 1790, geracao: 1788 },
    { hora: '10:00', pdp: 1790, geracao: 1790 },
    { hora: '10:30', pdp: 1790, geracao: 1792 },
    { hora: '11:00', pdp: 1790, geracao: 1787 },
    { hora: '11:30', pdp: 1790, geracao: 1789 },
    { hora: '12:00', pdp: 1790, geracao: 993 },  // Queda significativa
    { hora: '12:30', pdp: 1790, geracao: 1005 },
    { hora: '13:00', pdp: 1790, geracao: 1450 },
    { hora: '13:30', pdp: 1790, geracao: 1650 },
    { hora: '14:00', pdp: 1790, geracao: 1750 },
    { hora: '14:30', pdp: 1790, geracao: 1785 },
    { hora: '15:00', pdp: 1790, geracao: 1790 },
    { hora: '15:30', pdp: 1790, geracao: 1788 },
    { hora: '16:00', pdp: 1790, geracao: 1792 },
    { hora: '16:30', pdp: 1790, geracao: 1787 },
    { hora: '17:00', pdp: 1790, geracao: 1791 },
    { hora: '17:30', pdp: 1790, geracao: 1789 },
    { hora: '18:00', pdp: 1790, geracao: 1793 },
    { hora: '18:30', pdp: 1790, geracao: 1786 },
    { hora: '19:00', pdp: 1790, geracao: 1795 },
    { hora: '19:30', pdp: 1790, geracao: 1788 },
    { hora: '20:00', pdp: 1790, geracao: 1790 },
    { hora: '20:30', pdp: 1790, geracao: 1792 },
    { hora: '21:00', pdp: 1790, geracao: 1787 },
    { hora: '21:30', pdp: 1790, geracao: 1789 },
    { hora: '22:00', pdp: 1790, geracao: 1791 },
    { hora: '22:30', pdp: 1790, geracao: 1788 },
    { hora: '23:00', pdp: 1790, geracao: 1793 },
    { hora: '23:30', pdp: 1790, geracao: 1786 }
];

// Observações de exemplo
const observacoesExemplo = [
    {
        hora: '12:00',
        geracao: 993,
        pdp: 1790,
        desvio: -797,
        texto: 'Queda significativa de geração - verificar equipamentos. Possível problema na unidade geradora 3.',
        timestamp: new Date('2024-01-15T12:00:00').toISOString()
    }
];

function generateDataExcel() {
    console.log('📊 Gerando data.xlsx...');

    const ws = XLSX.utils.json_to_sheet(dataExemplo);

    // Ajustar largura das colunas
    ws['!cols'] = [
        { wch: 8 },  // hora
        { wch: 10 }, // pdp
        { wch: 10 }  // geracao
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    XLSX.writeFile(wb, 'data.xlsx');

    console.log('✅ data.xlsx criado com sucesso! (48 linhas)');
}

function generateObservationsExcel() {
    console.log('📝 Gerando observacoes.xlsx...');

    const ws = XLSX.utils.json_to_sheet(observacoesExemplo);

    // Ajustar largura das colunas
    ws['!cols'] = [
        { wch: 8 },  // hora
        { wch: 10 }, // geracao
        { wch: 10 }, // pdp
        { wch: 10 }, // desvio
        { wch: 60 }, // texto
        { wch: 25 }  // timestamp
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Observações');
    XLSX.writeFile(wb, 'observacoes.xlsx');

    console.log('✅ observacoes.xlsx criado com sucesso! (1 observação)');
}

// Executar
console.log('🏭 UHE Teles Pires - Gerador de Arquivos Excel\n');

try {
    generateDataExcel();
    generateObservationsExcel();
    console.log('\n🎉 Todos os arquivos foram gerados com sucesso!');
} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error('\n❌ Erro: Biblioteca xlsx não encontrada.');
        console.log('\n📦 Instale a dependência executando:');
        console.log('   npm install xlsx');
        console.log('\nOu use a versão HTML (generate-excel.html) que não requer instalação.');
    } else {
        console.error('\n❌ Erro:', error.message);
    }
    process.exit(1);
}
