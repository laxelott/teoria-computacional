#include <math.h>
#include <time.h>

#include <algorithm>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

using namespace std;

// -- VARIABLES GLOBALES
// Constantes
const string txtFileName = "primos.txt";
const string datFilename = "primos.dat";
// Variables
ofstream txt, dat;

// -- FUNCIONES INTERNAS
// -- Aritmetica
// Calcular el numero de unos en binario de cualquier entero
int calcularUnos(int num) {
    int unos;
    while (num > 0) {
        if (num % 2 != 0) {
            ++unos;
        }
        num /= 2;
    }
    return unos;
}

// -- Manipulación de archivos
// Inicializar archivos para escritura
void inicializarArchivos() {
    txt.open(txtFileName, ios_base::trunc);
    dat.open(datFilename, ios_base::trunc);

    txt << "{";
    dat << "#X\tY\tlog2\tlog10" << endl;
}
void cerrarArchivos() {
    txt.close();
    dat.close();
}
vector<bool> dec2bin(int dec) {
    vector<bool> bits;
    while (dec > 0) {
        bits.push_back(dec & 1);
        dec /= 2;
    }
    reverse(bits.begin(), bits.end());
    return bits;
}

// Procesar el resultado para ponerlo dentro de los archivos
void escribirResultado(int resultado, bool final = false) {
    int unos = calcularUnos(resultado);
    vector<bool> binario = dec2bin(resultado);
    int len = binario.size();

    txt << endl;
    for (int i = 0; i < len; ++i) {
        txt << binario[i] ? '1' : '0';
    }
    if (!final) {
        txt << ",";
    }
    dat << resultado << "\t"
        << unos << "\t"
        << log2(unos) << "\t"
        << log10(unos) << endl;
}
// Imprimir menu y conseguir opción elegida
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
// Calcular primos hasta el límite
void procesar(int limite) {
    bool primo;
    int numPrimo = 2;

    inicializarArchivos();

    cout << "Procesando..." << endl;
    for (int i = 3; i <= limite; ++i) {
        primo = true;
        cout << i;

        for (int j = i - 1; j > 1; --j) {
            if (i % j == 0) {
                primo = false;
                break;
            }
        }

        if (primo) {
            escribirResultado(numPrimo);
            numPrimo = i;
        }
        cout << '\r';
    }
    escribirResultado(numPrimo, true);

    txt << endl
        << "}";
}

// MAIN
int main(int argc, char const *argv[]) {
    int limite, respuesta;
    bool salir = false;

    while (true) {
        switch (menu()) {
            case 0:
                salir = true;
                break;
            case 1:
                while (true) {
                    cout << "Inserta el limite: ";
                    cin >> limite;

                    if (limite > 1 && limite <= 1000000) {
                        break;
                    } else {
                        cout << "Limite incorrecto!" << endl;
                    }
                }
                break;
            case 2:
                srand(time(NULL));
                limite = (rand() % 999998) + 2;
                cout << "n=" << limite << endl;
                break;
            default:
                cout << "Opcion incorrecta!";
                salir = true;
                break;
        }

        if (salir) {
            break;
        }

        procesar(limite);

        cout << "Los resultados estan en sus archivos respectivos c:" << endl
             << endl;
    }

    return 0;
}