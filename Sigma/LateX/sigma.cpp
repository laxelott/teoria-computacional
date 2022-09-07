#include <time.h>

#include <algorithm>
#include <cmath>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

using namespace std;

// CONSTANTES
const string sigmaFileName = "sigma.txt";
const string binarioFileName = "binario.txt";
const string graficaFileName = "grafica.dat";
const string divisionFileName = "binario32.txt";
const string graficaDivisionFileName = "grafica32.dat";

// VARIABLES
ofstream sigmaFile;
ofstream binarioFile;
ofstream graficaFile;
ofstream divisionFile;
ofstream graficaDivisionFile;

// FUNCIONES AUXILIARES
int menu() {
    int respuesta;

    cout << "----------" << endl;
    cout << "-- Menu --" << endl;
    cout << "0. Salir" << endl;
    cout << "1. Insertar limite" << endl;
    cout << "2. Limite automatico" << endl;
    cout << "Inserte la opcion: ";
    cin >> respuesta;

    return respuesta;
}

// FUNCIONES AUXILIARES
vector<bool> dec2bin(long dec, int len) {
    vector<bool> bits;
    for (int i = 0; i < len; ++i) {
        bits.push_back(dec & 1);
        dec /= 2;
    }
    reverse(bits.begin(), bits.end());
    return bits;
}
int calcularUnos(vector<bool> binario) {
    int unos, len;
    len = binario.size();
    for (int i = 0; i < len; ++i) {
        unos += binario[i];
    }
    return unos;
}
void dividirBinario() {
    ifstream file(binarioFileName);
    char c;
    int i = 1;

    while (file.get(c)) {
        if (i % 33 == 0) {
            i = 1;
            divisionFile << endl;
        }
        i++;
        divisionFile << c;
    }
}

// FUNCIONES DE ARCHIVOS
void escribirSigma(vector<bool> binario) {
    int len = binario.size();
    for (int i = 0; i < len; ++i) {
        sigmaFile << binario[i] ? '1' : '0';
        binarioFile << binario[i] ? '1' : '0';
    }
    sigmaFile << ',' << endl;
}
void escribirGrafica(int num, int unos) {
    graficaFile << num << '\t';
    graficaFile << unos << '\t';
    graficaFile << log2(unos) << '\t';
    graficaFile << log10(unos) << endl;
}
void escribirGraficaDividida() {
    ifstream file(divisionFileName);
    string line;
    char c;
    int i = 1;
    int unos, len;

    while (getline(file, line)) {
        unos = 0;
        len = line.size();
        for (int i = 0; i < len; ++i) {
            unos += line[i] == '1' ? 1 : 0;
        }

        graficaDivisionFile << i << '\t';
        graficaDivisionFile << unos << '\t';
        graficaDivisionFile << log2(unos) << '\t';
        graficaDivisionFile << log10(unos) << endl;
        ++i;
    }
}
void abrirArchivos() {
    sigmaFile.open(sigmaFileName);
    binarioFile.open(binarioFileName);
    graficaFile.open(graficaFileName);
    divisionFile.open(divisionFileName);
    graficaDivisionFile.open(graficaDivisionFileName);
}
void cerrarArchivos() {
    sigmaFile.close();
    binarioFile.close();
    graficaFile.close();
    divisionFile.close();
    graficaDivisionFile.close();
}

// FUNCION PRINCIPAL
void procesar(int k) {
    int unos, limite;
    bool final = false;

    sigmaFile << "{e," << endl;

    cout << "Iniciando...";

    // Calcular las permutaciones
    for (int i = 0; i <= k; ++i) {
        cout << endl
             << i << ":" << endl;
        limite = pow(2, i);
        final = i == k;

        for (long j = 0; j < limite; ++j) {
            cout << "\r\t" << j;
            vector<bool> binario = dec2bin(j, i + 1);

            escribirSigma(binario);

            if (final) {
                unos = calcularUnos(binario);
                escribirGrafica(j, unos);
            }
        }
    }

    dividirBinario();
    escribirGraficaDividida();
}

// MAIN
int main() {
    int k;
    string resultado;
    int respuesta;
    bool continuar = true;

    while (true) {
        respuesta = menu();

        switch (respuesta) {
            case 0:
                continuar = false;
                break;
            case 1:
                cout << "Inserte k" << endl;
                cin >> k;
                break;
            case 2:
                srand(time(NULL));
                k = rand() % 1000;
                cout << "K = " << k;
                break;
        }
        if (!continuar) {
            break;
        }

        abrirArchivos();
        procesar(k);
        cerrarArchivos();

        cout << endl
             << "El resultado esta en los archivos c:";
    }
}