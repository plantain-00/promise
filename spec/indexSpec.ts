import Promise from "../dist/nodejs/index";

it("resolve then", () => {
    new Promise<number>((resolve, reject) => {
        resolve(1);
    }).then(value => {
        expect(value).toEqual(1);
    });

    new Promise<number>((resolve, reject) => {
        resolve(2);
    }).then(value => {
        expect(value).toEqual(2);
    }, reason => {
        fail();
    });
});

it("resolve resolve then", () => {
    new Promise<number>((resolve, reject) => {
        resolve(1.1);
        resolve(1.2);
    }).then(value => {
        expect(value).toEqual(1.1);
    });
});

it("reject then", () => {
    new Promise<number>((resolve, reject) => {
        reject(3);
    }).then(value => {
        fail();
    }, reason => {
        expect(reason).toEqual(3);
    });
});

it("reject then catch", () => {
    new Promise<number>((resolve, reject) => {
        reject(4);
    }).then(value => {
        fail();
    }, reason => {
        expect(reason).toEqual(4);
    }).catch(reason => {
        fail();
    });

    new Promise<number>((resolve, reject) => {
        reject(5);
    }).then(value => {
        fail();
    }).catch(reason => {
        expect(reason).toEqual(5);
    });
});

it("throw then catch", () => {
    new Promise<number>((resolve, reject) => {
        throw 6;
    }).then(value => {
        fail();
    }).catch(reason => {
        expect(reason).toEqual(6);
    });
});

it("reject in then", () => {
    new Promise<number>((resolve, reject) => {
        resolve(7);
    }).then(value => {
        expect(value).toEqual(7);
        return Promise.reject(value);
    }).catch(reason => {
        expect(reason).toEqual(7);
    });
});

it("throw in then", () => {
    new Promise<number>((resolve, reject) => {
        resolve(8);
    }).then(value => {
        expect(value).toEqual(8);
        throw value;
    }).catch(reason => {
        expect(reason).toEqual(8);
    });
});

it("return in then", () => {
    new Promise<number>((resolve, reject) => {
        resolve(9);
    }).then(value => {
        expect(value).toEqual(9);
        return value;
    }).then(value => {
        expect(value).toEqual(9);
    });

    new Promise<number>((resolve, reject) => {
        resolve(17);
    }).then(value => {
        expect(value).toEqual(17);
        return value + " string";
    }).then(value => {
        expect(value).toEqual("17 string");
    });
});

it("return promise in then", () => {
    new Promise<number>((resolve, reject) => {
        resolve(10);
    }).then(value => {
        expect(value).toEqual(10);
        return Promise.resolve(value);
    }).then(value => {
        expect(value).toEqual(10);
    });
});

it("promise.all resolve", () => {
    Promise.all([
        Promise.resolve(11),
        Promise.resolve(12),
    ]).then(values => {
        expect(values).toEqual([11, 12]);
    });

    Promise.all([
        new Promise(resolve => {
            setTimeout(() => {
                resolve(15);
            }, 10);
        }),
        new Promise(resolve => {
            setTimeout(() => {
                resolve(16);
            }, 10);
        }),
    ]).then(values => {
        expect(values).toEqual([15, 16]);
    });
});

it("promise.all reject", () => {
    Promise.all([
        Promise.resolve(13),
        Promise.reject(14),
    ]).then(values => {
        fail();
    }, reason => {
        expect(reason).toEqual(14);
    });
});

it("reject catch", () => {
    new Promise<number>((resolve, reject) => {
        reject(18);
    }).catch(reason => {
        expect(reason).toEqual(18);
    });

    new Promise<number>((resolve, reject) => {
        setTimeout(() => {
            reject(19);
        }, 10);
    }).catch(reason => {
        expect(reason).toEqual(19);
    });
});

it("resolve promise then", () => {
    new Promise<number>((resolve, reject) => {
        resolve(Promise.resolve(20));
    }).then(value => {
        expect(value).toEqual(20);
    });

    new Promise<number>((resolve, reject) => {
        resolve(Promise.resolve(Promise.resolve(21)));
    }).then(value => {
        expect(value).toEqual(21);
    });
});
